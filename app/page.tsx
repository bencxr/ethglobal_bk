/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */

"use client";

import { useEffect, useState } from "react";
// IMP START - Quick Start
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
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";
import { AccountAbstractionProvider, SafeSmartAccount } from "@web3auth/account-abstraction-provider";

import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { ethers } from "ethers";

const projectId = "3493580c-c1e2-42e3-9c88-e5e432644331";

const onrampBuyUrl = getOnrampBuyUrl({
  projectId,
  addresses: { ["0x0E7EbCf16c35Cb53a8B4a4b57007eBd2791796d0"]: ["base"] },
  assets: ["USDC"],
  presetFiatAmount: 20,
  fiatCurrency: "USD",
});

// IMP END - Quick Start

// IMP START - Blockchain Calls
import RPC from "./ethersRPC";
// import RPC from "./viemRPC";
// import RPC from "./web3RPC";
// IMP END - Blockchain Calls

// IMP START - Dashboard Registration
const clientId = "BFIqnq2jKx4HB0PscxrJW8f_4C287cqgBvbb7ZL2v4YVe3yuAqxFQkuKp6-JuFN0wrZaIrsAEziQaDQq47PHAs8"; // get from https://dashboard.web3auth.io
// IMP END - Dashboard Registration

// IMP START - Chain Config
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
// IMP END - Chain Config

// IMP START - SDK Initialization
const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

const accountAbstractionProvider = new AccountAbstractionProvider({
  config: {
    chainConfig,
    smartAccountInit: new SafeSmartAccount(),
    bundlerConfig: {
      // Get the pimlico API Key from dashboard.pimlico.io
      url: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_ggWVh99izrsA8rmbSvRNRa`,
    },
    paymasterConfig: {
      // Get the pimlico API Key from dashboard.pimlico.io
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
const walletServicesPlugin = new WalletServicesPlugin();

const authAdapter = new AuthAdapter({
  adapterSettings: {
    clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
    uxMode: UX_MODE.REDIRECT,
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

web3auth.addPlugin(walletServicesPlugin);
// IMP END - SDK Initialization

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
const AAVE_POOL_ADDRESS = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"; // Base Aave V3 Pool
const USDC_ABI = ["function approve(address spender, uint256 amount) public returns (bool)"];
const AAVE_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
];

const AUSDC_ADDRESS = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"; // aUSDC on Base
const AUSDC_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  web3auth.addListener(ADAPTER_EVENTS.CONNECTED, () => {
    setLoggedIn(true);
  });

  useEffect(() => {
    const init = async () => {
      try {
        // IMP START - SDK Initialization
        await web3auth.init();
        // IMP END - SDK Initialization
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          // Add the plugin to web3auth
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const showCheckout = () => {
    console.log(walletServicesPlugin.status);
    if (walletServicesPlugin.status === "connected") {
      walletServicesPlugin.showCheckout({
        show: true,
        fiatList: ["USD"],
        tokenList: ["USDC"],
      });
    }
  };

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
  };

  const getUsdcBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const balance = await RPC.getBalance(provider);
    uiConsole(balance);
  };

  const depositUsdc = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      // Get current gas price
      const feeData = await ethersProvider.getFeeData();
      if (!feeData.gasPrice) throw new Error("Could not get gas price");

      // Initialize USDC contract
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

      // Amount to deposit (1 USDC)
      const depositAmount = ethers.parseUnits("1", 6);

      // Prepare transaction parameters (removed 'to' field)
      const approveTxParams = {
        from: userAddress,
        gasPrice: feeData.gasPrice,
        gasLimit: 100000n, // Fixed gas limit
        value: 0n,
        nonce: await ethersProvider.getTransactionCount(userAddress),
      };

      // Approve USDC spending
      const approveTx = await usdcContract.approve(AAVE_POOL_ADDRESS, depositAmount, approveTxParams);
      uiConsole("Approval transaction sent:", approveTx.hash);

      const approveReceipt = await approveTx.wait();
      uiConsole("USDC approved for Aave:", approveReceipt.hash);

      // Initialize Aave Pool contract
      const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);

      // Prepare supply transaction parameters (removed 'to' field)
      const supplyTxParams = {
        from: userAddress,
        gasPrice: feeData.gasPrice,
        gasLimit: 250000n, // Fixed gas limit
        value: 0n,
        nonce: await ethersProvider.getTransactionCount(userAddress),
      };

      // Supply to Aave
      const depositTx = await aavePool.supply(USDC_ADDRESS, depositAmount, userAddress, 0, supplyTxParams);
      uiConsole("Supply transaction sent:", depositTx.hash);

      const receipt = await depositTx.wait();
      uiConsole("Successfully deposited USDC to Aave:", receipt.hash);
    } catch (error: any) {
      // More detailed error logging
      uiConsole("Error depositing USDC:");
      if (error.error) {
        uiConsole("Inner error:", error.error);
      }
      if (error.transaction) {
        uiConsole("Transaction:", error.transaction);
      }
      if (error.receipt) {
        uiConsole("Receipt:", error.receipt);
      }
      uiConsole("Full error:", error);
    }
  };

  const getAaveUsdcBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();

      // Get the checksummed address
      const checksummedAddress = ethers.getAddress(AUSDC_ADDRESS);

      // Initialize aUSDC contract with checksummed address
      const aUsdcContract = new ethers.Contract(checksummedAddress, AUSDC_ABI, signer);

      // Get balance
      const balance = await aUsdcContract.balanceOf(userAddress);

      // Format balance (aUSDC has 6 decimals like USDC)
      const formattedBalance = ethers.formatUnits(balance, 6);

      uiConsole("aUSDC Balance:", formattedBalance);
      return formattedBalance;
    } catch (error) {
      uiConsole("Error getting aUSDC balance:", error);
      return null;
    }
  };

  // IMP START - Blockchain Calls
  // Check the RPC file for the implementation
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
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
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div id="cbonramp-button-container">
          <FundButton fundingUrl={onrampBuyUrl} />
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
          <button onClick={depositUsdc} className="card">
            Deposit USDC into Aave
          </button>
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
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/no-modal" rel="noreferrer">
          Web3Auth{" "}
        </a>
        & NextJS Quick Start
      </h1>

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
