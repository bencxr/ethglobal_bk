/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */

"use client";

import { useEffect, useState } from "react";
// IMP START - Quick Start
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, IProvider, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";
import {
  AccountAbstractionProvider,
  SafeSmartAccount,
} from "@web3auth/account-abstraction-provider";

import { FundButton, getOnrampBuyUrl } from '@coinbase/onchainkit/fund';

const projectId = '3493580c-c1e2-42e3-9c88-e5e432644331';

const onrampBuyUrl = getOnrampBuyUrl({
  projectId,
  addresses: { ["0x0E7EbCf16c35Cb53a8B4a4b57007eBd2791796d0"]: ['base'] },
  assets: ['USDC'],
  presetFiatAmount: 20,
  fiatCurrency: 'USD'
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
  useAAWithExternalWallet: true
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
