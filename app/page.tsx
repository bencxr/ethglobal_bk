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

const projectId = "3493580c-c1e2-42e3-9c88-e5e432644331";

import RPC from "./ethersRPC";

const clientId = "BFIqnq2jKx4HB0PscxrJW8f_4C287cqgBvbb7ZL2v4YVe3yuAqxFQkuKp6-JuFN0wrZaIrsAEziQaDQq47PHAs8"; // get from https://dashboard.web3auth.io
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x2105",
  rpcTarget: "https://rpc.ankr.com/base",
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
  });

  useEffect(() => {
    sendGameState();
  }, [loggedIn]);

  const sendGameState = async () => {
    const state = await getState();

    console.log("Sending Game State");
    console.log(state);
    sendMessage("GameController", "LoginEvent", JSON.stringify(state));
  }

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

    addEventListener("PromptLogin", () => { login(); });
    addEventListener("GetState", () => { sendGameState(); });
    addEventListener("StoreBlob", useCallback((blob) => {
      storeGameBlob(blob);
    }, []));
  }, []);


  const storeGameBlob = async (blob: string) => {
    localStorage.setItem("gameBlob", blob);
  }

  const getState = async () => {
    let state = {
      loggedIn: false,
      gameBlob: {},
      user: {
        name: "",
        email: "",
        address: "0x"
      },
      balances: {
        base: 0,
        usdc: 0,
        ausdc: 0
      }
    };
    state.loggedIn = loggedIn;
    if (!loggedIn) {
      console.log("Not logged in");
      return state;
    }
    if (!provider) {
      uiConsole("provider not initialized yet");
      return state;
    }
    state.gameBlob = JSON.parse(localStorage.getItem("gameBlob") || "{}");
    state.user.address = await RPC.getAccounts(provider);
    const user = await web3auth.getUserInfo();
    state.user.name = user.name;
    state.user.email = user.email;

    state.balances.base = Number(await RPC.getBalance(provider));
    state.balances.usdc = Number(await RPC.getUsdcBalance(provider));
    state.balances.ausdc = Number(await RPC.getAaveUsdcBalance(provider));

    return state;
  }

  const login = async () => {
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
    sendGameState();
  };

  const getUsdcBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const balance = await RPC.getUsdcBalance(provider);
    uiConsole("USDC Balance:", balance);
  };

  const depositUsdc = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    if (!depositAmount || isNaN(Number(depositAmount))) {
      uiConsole("Please enter a valid amount");
      return;
    }
    const receipt = await RPC.depositUsdc(provider, depositAmount);
    uiConsole("Deposit result:", receipt);
    setDepositAmount(""); // Reset input after deposit
  };

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
    uiConsole(balance);
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
  }

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={showState} className="card">
            Show State
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={fundWalletWithUSDC} className="card">
            Fund Wallet with USDC
          </button>
          <div id="cbonramp-button-container" style={{ visibility: "hidden" }}>
            <FundButton fundingUrl={onrampBuyUrl} />
          </div>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
        <div>
          <button onClick={getUsdcBalance} className="card">
            Get USDC Balance
          </button>
        </div>
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
            <button onClick={depositUsdc} className="card">
              Deposit USDC into Aave
            </button>
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
            <button onClick={withdrawFromAave} className="card">
              Withdraw from Aave
            </button>
          </div>
        </div>
        <div>
          <button onClick={getAaveUsdcBalance} className="card">
            Get aUSDC Balance
          </button>
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
      <Unity unityProvider={unityProvider} style={{
        width: '600px',
        height: '1100px',
      }} />
      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
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
