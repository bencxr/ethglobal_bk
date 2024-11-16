/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  IProvider,
  UX_MODE,
  WALLET_ADAPTERS,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";
import { AccountAbstractionProvider, SafeSmartAccount } from "@web3auth/account-abstraction-provider";

import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { Unity, useUnityContext } from "react-unity-webgl";

import { storeGameBlob, retrieveGameBlob, initializeNillion } from "./nillion";

const projectId = "3493580c-c1e2-42e3-9c88-e5e432644331";

import RPC from "./ethersRPC";

const clientId = "BFIqnq2jKx4HB0PscxrJW8f_4C287cqgBvbb7ZL2v4YVe3yuAqxFQkuKp6-JuFN0wrZaIrsAEziQaDQq47PHAs8"; // get from https://dashboard.web3auth.io
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x2105",
  rpcTarget: "https://alien-wild-sea.base-mainnet.quiknode.pro/ca5bb3cb0b7b348e774bff7a5c2de16660cbfe9d",
  displayName: "Base",
  blockExplorerUrl: "https://basescan.org/",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",
};

// IMP START - SDK Initialization
const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
const accountAbstractionProvider = new AccountAbstractionProvider({
  config: {
    chainConfig,
    smartAccountInit: new SafeSmartAccount(),
    bundlerConfig: {
      url: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_ggWVh99izrsA8rmbSvRNRa`,
    },
    paymasterConfig: {
      url: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_ggWVh99izrsA8rmbSvRNRa`,
    },
  },
});

const web3auth = new Web3AuthNoModal({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
  accountAbstractionProvider,
  useAAWithExternalWallet: true,
});

const authAdapter = new AuthAdapter({
  adapterSettings: {
    clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    uxMode: UX_MODE.POPUP,
    whiteLabel: {
      appName: "W3A Heroes",
      appUrl: "https://web3auth.io",
      logoLight: "https://web3auth.io/images/web3auth-logo.svg",
      logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
      defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl, tr
      mode: "dark", // whether to enable dark mode. defaultValue: auto
      theme: {
        primary: "#00D1B2",
      } as WHITE_LABEL_THEME,
      useLogoLoader: true,
    } as WhiteLabelData,
  },
  privateKeyProvider,
});
web3auth.configureAdapter(authAdapter);
// IMP END - SDK Initialization

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [onrampBuyUrl, setOnrampBuyUrl] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [gameInput, setGameInput] = useState("");
  const [localGameBlob, setLocalGameBlob] = useState("");

  const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "build/Build/build.loader.js",
    dataUrl: "build/Build/build.data",
    frameworkUrl: "build/Build/build.framework.js",
    codeUrl: "build/Build/build.wasm",
  });

  const generateOnrampBuyUrl = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
    const onrampBuyUrl = getOnrampBuyUrl({
      projectId,
      addresses: { [address]: ["base"] },
      assets: ["USDC"],
      presetFiatAmount: 20,
      fiatCurrency: "USD",
    });
    setOnrampBuyUrl(onrampBuyUrl);
  };

  web3auth.addListener(ADAPTER_EVENTS.CONNECTED, async () => {
    setLoggedIn(true);
    generateOnrampBuyUrl();
    handleRetrieveGameBlob();
  });

  useEffect(() => {
    sendGameState("LoginEvent");
  }, [loggedIn]);

  useEffect(() => {
    const interval = setInterval(() => {
      sendGameState("UpdateState");
    }, 2000);
    return () => clearInterval(interval);
  }, [loggedIn, localGameBlob, sendMessage]);

  const sendGameState = async (eventName: string) => {
    const state = await getState();

    console.log("Sending Game State", new Date().toISOString());
    console.log(state);
    try {
      sendMessage("GameController", eventName, JSON.stringify(state));
    } catch (error) {
      console.log("Error sending game state:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // IMP START - SDK Initialization
        await web3auth.init();
        // IMP END - SDK Initialization
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          generateOnrampBuyUrl();
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  /**
   * methods that deal with game integration
   */
  addEventListener("PromptLogin", () => { login(); });
  addEventListener("PromptFunding", () => { fundWalletWithUSDC(); });

  addEventListener("GetState", () => { sendGameState("UpdateState"); });

  const getState = async () => {
    let state = {
      loggedIn: false,
      gameBlob: "",
      user: {
        name: "",
        email: "",
        address: "0x",
      },
      balances: {
        base: 0,
        usdc: 0,
        ausdc: 0,
      },
    };
    state.loggedIn = loggedIn;
    if (!loggedIn) {
      return state;
    }
    if (!provider) {
      uiConsole("provider not initialized yet");
      return state;
    }
    state.gameBlob = localGameBlob || "";
    state.user.address = await RPC.getAccounts(provider);
    const user = await web3auth.getUserInfo();
    state.user.name = user.name;
    state.user.email = user.email;

    state.balances.base = Number(await RPC.getBalance(provider));
    state.balances.usdc = Number(await RPC.getUsdcBalance(provider));
    state.balances.ausdc = Number(await RPC.getAaveUsdcBalance(provider));

    return state;
  };
  ////// END GAME MESSAGING INTEGRATION //////

  const login = async () => {
    if (loggedIn) return;
    // IMP START - Login
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
      loginProvider: "google",
    });
    // IMP END - Login
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const getUserInfo = async () => {
    // IMP START - Get User Information
    const user = await web3auth.getUserInfo();
    // IMP END - Get User Information
    uiConsole(user);
  };

  const logout = async () => {
    // IMP START - Logout
    await web3auth.logout();
    // IMP END - Logout
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
    sendGameState("LogoutEvent");
  };

  const getUsdcBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const balance = await RPC.getUsdcBalance(provider);
    uiConsole("USDC Balance:", balance);
  };

  const depositUsdc = useCallback(async () => {
    let amountToDeposit = depositAmount;
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!amountToDeposit || isNaN(Number(amountToDeposit))) {
      amountToDeposit = (await RPC.getUsdcBalance(provider)) || "0";
    }
    console.log("Depositing USDC: " + amountToDeposit);
    const receipt = await RPC.depositUsdc(provider, amountToDeposit);
    uiConsole("Deposit result:", receipt);
    setDepositAmount(""); // Reset input after deposit
  }, [provider, depositAmount, uiConsole]);

  useEffect(() => {
    // Create the callback function inside useEffect to access current provider value
    const handleDepositAll = () => {
      depositUsdc();
    };

    // Add the event listener
    addEventListener("DepositAll", handleDepositAll);

    // Clean up by removing the event listener when dependencies change
    return () => {
      removeEventListener("DepositAll", handleDepositAll);
    };
  }, [depositUsdc]); // Include depositUsdc in dependencies

  const getAccounts = async () => {
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
  };
  const getAaveUsdcBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const balance = await RPC.getAaveUsdcBalance(provider);
    uiConsole("aUSDC Balance:", balance);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const balance = await RPC.getBalance(provider);
    uiConsole("ETH Balance:", balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signedMessage = await RPC.signMessage(provider);
    uiConsole(signedMessage);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole("Sending Transaction...");
    const transactionReceipt = await RPC.sendTransaction(provider);
    uiConsole(transactionReceipt);
  };
  // IMP END - Blockchain Calls

  const withdrawFromAave = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      uiConsole("Please enter a valid amount");
      return;
    }
    const receipt = await RPC.withdrawFromAave(provider, withdrawAmount);
    uiConsole("Withdrawal result:", receipt);
    setWithdrawAmount(""); // Reset input after withdrawal
  };

  const fundWalletWithUSDC = async () => {
    document.getElementById("cbonramp-button-container").children[0].click();
  };

  const showState = async () => {
    const state = await getState();
    uiConsole(state);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const handleStoreGameBlob = async (blob: string) => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!blob) { blob = gameInput; }
    if (!blob) {
      uiConsole("Please enter some data to store");
      return;
    }
    try {
      const signedMessage = await RPC.signMessage(provider);
      initializeNillion(signedMessage);

      setLocalGameBlob(blob);
      console.log("Storing game blob: ", blob);
      const response = await storeGameBlob(blob);
      uiConsole("Game data stored successfully:", response);
      setGameInput(""); // Clear input after successful store
    } catch (error) {
      console.error("Error in handleStoreGameBlob:", error);
      uiConsole("Error storing game data:", error);
    }
  };
  addEventListener("StoreBlob", useCallback((blob) => { handleStoreGameBlob(blob); }, [provider, handleStoreGameBlob]));

  const handleRetrieveGameBlob = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const signedMessage = await RPC.signMessage(provider);
      console.log("Signed Message:", signedMessage);
      initializeNillion(signedMessage);

      const retrievedData = await retrieveGameBlob();
      console.log("Retrieved Data:", retrievedData);

      if (retrievedData) {
        setLocalGameBlob(retrievedData.secret);
        console.log("setlocalgameblob", retrievedData.secret);
        uiConsole("Retrieved game state:", retrievedData);
      } else {
        uiConsole("No data retrieved");
      }
    } catch (error) {
      console.error("Full error details:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      uiConsole("Error retrieving game state:", error.message);
    }
  };

  const checkAllowance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const allowance = await RPC.checkUsdcAllowance(provider);
      uiConsole("USDC Allowance for Aave:", allowance, "USDC");
    } catch (error) {
      console.error("Error checking allowance:", error);
      uiConsole("Error checking allowance:", error);
    }
  };

  const getInterestProfits = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const address = await RPC.getAccounts(provider);

      uiConsole("Aave Interest Profits:", profits);
    } catch (error) {
      console.error("Error getting interest profits:", error);
      uiConsole("Error getting interest profits:", error.message);
    }
  };

  const getInterestIncome = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const position = await RPC.getAavePosition(provider);

      if (position) {
        uiConsole({
          "Interest Income (USDC)": position.interestIncome,
          "Principal Amount (USDC)": position.principalAmount,
          "Current Balance (aUSDC)": position.currentBalance,
        });
      } else {
        uiConsole("No Aave position found");
      }
    } catch (error) {
      console.error("Error getting interest income:", error);
      uiConsole("Error getting interest income:", error.message);
    }
  };

  const getTransactionHistory = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const history = await RPC.getAaveTransactionHistory(provider);

      if (history && history.transactions.length > 0) {
        // Format the transaction list for display
        const transactionList = history.transactions.map((tx) => ({
          Type: tx.type,
          Amount: `${tx.amount} USDC`,
          Date: tx.timestamp,
        }));

        uiConsole({
          "Transaction History": transactionList,
          Summary: {
            "Total Deposited": `${history.totalDeposited} USDC`,
            "Total Withdrawn": `${history.totalWithdrawn} USDC`,
            "Current Balance": `${history.currentBalance} USDC`,
            "Total Income": `${history.totalIncome} USDC`,
          },
        });
      } else if (history) {
        uiConsole({
          Message: "No transactions found in recent history",
          "Current Balance": `${history.currentBalance} USDC`,
        });
      } else {
        uiConsole("Error retrieving transaction history");
      }
    } catch (error) {
      console.error("Error getting transaction history:", error);
      uiConsole("Error details:", error.message);
    }
  };

  const approveUsdcToAave = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const receipt = await RPC.approveUsdcToAave(provider);
      uiConsole("USDC Approval successful:", receipt);
    } catch (error) {
      console.error("USDC Approval failed:", error);
      uiConsole("USDC Approval failed:", error);
    }
  };

  const loggedInView = (
    <>
      <div className="flex-container">
        {/* Account Management */}
        <div className="section-header">Account</div>
        <div>
          <button onClick={getUserInfo} className="card">Get User Info</button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">Get Accounts</button>
        </div>
        <div>
          <button onClick={logout} className="card danger-button">Log Out</button>
        </div>

        {/* Wallet Operations */}
        <div className="section-header">Wallet</div>
        <div>
          <button onClick={getBalance} className="card">Get ETH Balance</button>
        </div>
        <div>
          <button onClick={getUsdcBalance} className="card">Get USDC Balance</button>
        </div>
        <div>
          <button onClick={fundWalletWithUSDC} className="card action-button">Fund Wallet with USDC</button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card action-button">Send Transaction</button>
        </div>
        <div>
          <button onClick={signMessage} className="card action-button">Sign Message</button>
        </div>

        {/* Aave Operations */}
        <div className="section-header">Aave Operations</div>
        <div>
          <div className="input-container">
            <input
              type="number"
              step="0.000001"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount in USDC"
              className="amount-input"
            />
            <button onClick={depositUsdc} className="card action-button">Deposit USDC into Aave</button>
          </div>
        </div>
        <div>
          <div className="input-container">
            <input
              type="number"
              step="0.000001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount in USDC"
              className="amount-input"
            />
            <button onClick={withdrawFromAave} className="card action-button">Withdraw from Aave</button>
          </div>
        </div>
        <div>
          <button onClick={getAaveUsdcBalance} className="card">Get Aave USDC Balance</button>
        </div>
        <div>
          <button onClick={checkAllowance} className="card">Get USDC Allowance</button>
        </div>
        <div>
          <button onClick={approveUsdcToAave} className="card action-button">Approve USDC to Aave</button>
        </div>
        <div>
          <button onClick={getInterestIncome} className="card">Get Interest Income</button>
        </div>
        {/* <div>
          <button onClick={getTransactionHistory} className="card">Get Transaction History</button>
        </div> */}

        {/* Game Data */}
        <div className="section-header">Game Data</div>
        <div>
          <div className="input-container">
            <input
              type="text"
              value={gameInput}
              onChange={(e) => setGameInput(e.target.value)}
              placeholder="Enter data to store"
              className="amount-input"
            />
            <button onClick={() => handleStoreGameBlob(gameInput)} className="card action-button">
              Store Game Data
            </button>
          </div>
        </div>
        <div>
          <button onClick={handleRetrieveGameBlob} className="card action-button">Retrieve Game Data</button>
        </div>
        <div>
          <button onClick={showState} className="card">Show Game State</button>
        </div>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <div className="main-content">
        <div className="unity-container">
          <Unity
            unityProvider={unityProvider}
            style={{
              width: "300px",
              height: "650px",
            }}
          />
        </div>
      </div>
      
      <div className="main-container">
        <div className="left-panel">
          <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
        </div>
        
        <div className="right-panel">
          <div id="console" style={{ whiteSpace: "pre-line" }}>
            <p style={{ whiteSpace: "pre-line" }}></p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-no-modal-sdk/quick-starts/nextjs-no-modal-quick-start"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
        <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeb3Auth%2Fweb3auth-pnp-examples%2Ftree%2Fmain%2Fweb-modal-sdk%2Fquick-starts%2Fnextjs-modal-quick-start&project-name=w3a-nextjs-modal&repository-name=w3a-nextjs-modal">
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
      </footer>
    </div>
  );
}

export default App;
