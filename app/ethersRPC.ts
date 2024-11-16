/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const AAVE_POOL_ADDRESS = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";
const USDC_ABI = ["function approve(address spender, uint256 amount) public returns (bool)"];
const AAVE_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
  "function withdraw(address asset, uint256 amount, address to) external returns (uint256)",
];
const AUSDC_ADDRESS = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB";
const AUSDC_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

const getChainId = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    // Get the connected Chain's ID
    const networkDetails = await ethersProvider.getNetwork();
    return networkDetails.chainId.toString();
  } catch (error) {
    return error;
  }
};

const getAccounts = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    return await address;
  } catch (error) {
    return error;
  }
};

const getBalance = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    // Get user's balance in ether
    const balance = ethers.formatEther(
      await ethersProvider.getBalance(address) // Balance is in wei
    );

    return balance;
  } catch (error) {
    return error as string;
  }
};

const sendTransaction = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const destination = "0xF15A780336068B58997bFd4640F008349c27636C";

    const amount = ethers.parseEther("0.001");

    // Submit transaction to the blockchain
    const tx = await signer.sendTransaction({
      to: destination,
      value: amount,
      // maxPriorityFeePerGas: "5000000000", // Max priority fee per gas
      // maxFeePerGas: "6000000000000", // Max fee per gas
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    return error as string;
  }
};

const signMessage = async (provider: IProvider): Promise<any> => {
  try {
    // For ethers v5
    // const ethersProvider = new ethers.providers.Web3Provider(provider);
    const ethersProvider = new ethers.BrowserProvider(provider);

    // For ethers v5
    // const signer = ethersProvider.getSigner();
    const signer = await ethersProvider.getSigner();
    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await signer.signMessage(originalMessage);

    return signedMessage;
  } catch (error) {
    return error as string;
  }
};

const getUsdcBalance = async (provider: IProvider): Promise<string | null> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ["function balanceOf(address account) external view returns (uint256)"],
      signer
    );

    const balance = await usdcContract.balanceOf(userAddress);
    return ethers.formatUnits(balance, 6);
  } catch (error) {
    console.error("Error getting USDC balance:", error);
    return null;
  }
};

const depositUsdc = async (provider: IProvider, amount: string): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const feeData = await ethersProvider.getFeeData();
    if (!feeData.gasPrice) throw new Error("Could not get gas price");

    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    const depositAmount = ethers.parseUnits(amount, 6);

    const approveTxParams = {
      from: userAddress,
      gasPrice: feeData.gasPrice,
      gasLimit: 100000n,
      value: 0n,
      nonce: await ethersProvider.getTransactionCount(userAddress),
    };

    const approveTx = await usdcContract.approve(AAVE_POOL_ADDRESS, depositAmount, approveTxParams);
    const approveReceipt = await approveTx.wait();

    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
    const supplyTxParams = {
      from: userAddress,
      gasPrice: feeData.gasPrice,
      gasLimit: 250000n,
      value: 0n,
      nonce: await ethersProvider.getTransactionCount(userAddress),
    };

    const depositTx = await aavePool.supply(USDC_ADDRESS, depositAmount, userAddress, 0, supplyTxParams);
    return await depositTx.wait();
  } catch (error) {
    return error;
  }
};

const getAaveUsdcBalance = async (provider: IProvider): Promise<string | null> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const checksummedAddress = ethers.getAddress(AUSDC_ADDRESS);
    const aUsdcContract = new ethers.Contract(checksummedAddress, AUSDC_ABI, signer);
    const balance = await aUsdcContract.balanceOf(userAddress);

    return ethers.formatUnits(balance, 6);
  } catch (error) {
    console.error("Error getting aUSDC balance:", error);
    return null;
  }
};

const withdrawFromAave = async (provider: IProvider, amount: string): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const feeData = await ethersProvider.getFeeData();
    if (!feeData.gasPrice) throw new Error("Could not get gas price");

    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
    const withdrawAmount = ethers.parseUnits(amount, 6);

    const withdrawTxParams = {
      from: userAddress,
      gasPrice: feeData.gasPrice,
      gasLimit: 250000n,
      value: 0n,
      nonce: await ethersProvider.getTransactionCount(userAddress),
    };

    const withdrawTx = await aavePool.withdraw(USDC_ADDRESS, withdrawAmount, userAddress, withdrawTxParams);
    return await withdrawTx.wait();
  } catch (error) {
    return error;
  }
};

export default {
  getChainId,
  getAccounts,
  getBalance,
  sendTransaction,
  signMessage,
  getUsdcBalance,
  depositUsdc,
  getAaveUsdcBalance,
  withdrawFromAave,
};
