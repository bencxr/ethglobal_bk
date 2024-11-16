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
    const originalMessage = "PRIVATE_SECRET_ELEPHANT_MESSAGE";

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

const approveUsdcToAave = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const feeData = await ethersProvider.getFeeData();
    if (!feeData.gasPrice) throw new Error("Could not get gas price");

    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    // Approve 5 USDC (with 6 decimals)
    const approveAmount = ethers.parseUnits("5", 6);

    const approveTxParams = {
      from: userAddress,
      gasPrice: feeData.gasPrice,
      gasLimit: 100000n,
      value: 0n,
      nonce: await ethersProvider.getTransactionCount(userAddress),
    };

    const approveTx = await usdcContract.approve(AAVE_POOL_ADDRESS, approveAmount, approveTxParams);
    return await approveTx.wait();
  } catch (error) {
    return error;
  }
};

const depositUsdc = async (provider: IProvider, amount: string): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const feeData = await ethersProvider.getFeeData();
    if (!feeData.gasPrice) throw new Error("Could not get gas price");

    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, signer);
    const depositAmount = ethers.parseUnits(amount, 6);

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

// Add these interfaces
interface AaveEvent {
  amount: bigint;
  timestamp: number;
}

interface AavePosition {
  interestIncome: string;
  principalAmount: string;
  currentBalance: string;
}

// Add this function to get all supply/withdraw events and calculate interest
const getAavePosition = async (provider: IProvider): Promise<AavePosition | null> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    // AToken contract for events and current balance
    const aUsdcContract = new ethers.Contract(
      "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB", // aUSDC on Base
      [
        "function scaledBalanceOf(address user) external view returns (uint256)",
        "function POOL() external view returns (address)",
        "function UNDERLYING_ASSET_ADDRESS() external view returns (address)",
        "function balanceOf(address user) external view returns (uint256)",
      ],
      signer
    );

    // Get current aUSDC balance directly
    const currentBalance = await aUsdcContract.balanceOf(userAddress);

    // Get scaled balance for principal calculation
    const scaledBalance = await aUsdcContract.scaledBalanceOf(userAddress);

    // Principal is the scaled balance (original deposit amount)
    const principalAmount = scaledBalance;

    // Interest income is the difference between current balance and principal
    const interestIncome = currentBalance - principalAmount;

    // Format with 6 decimals (USDC standard)
    return {
      interestIncome: ethers.formatUnits(interestIncome, 6),
      principalAmount: ethers.formatUnits(principalAmount, 6),
      currentBalance: ethers.formatUnits(currentBalance, 6),
    };
  } catch (error) {
    console.error("Error calculating Aave position:", error);
    return null;
  }
};

interface AaveTransaction {
  type: "deposit" | "withdrawal";
  amount: string;
  timestamp: string;
  blockNumber: number;
}

const getAaveTransactionHistory = async (
  provider: IProvider
): Promise<{
  transactions: AaveTransaction[];
  totalDeposited: string;
  totalWithdrawn: string;
  currentBalance: string;
  totalIncome: string;
} | null> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const userAddress = await signer.getAddress();

    const poolContract = new ethers.Contract(
      AAVE_POOL_ADDRESS,
      [
        "event Supply(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 referralCode)",
        "event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount)",
      ],
      signer
    );

    const currentBlock = await ethersProvider.getBlockNumber();
    const fromBlock = currentBlock - 100000;

    const depositEvents = await poolContract.queryFilter(
      poolContract.filters.Supply(
        USDC_ADDRESS, // reserve (indexed)
        null, // user (not indexed)
        userAddress // onBehalfOf (indexed)
      ),
      fromBlock
    );

    const withdrawEvents = await poolContract.queryFilter(
      poolContract.filters.Withdraw(
        USDC_ADDRESS, // reserve (indexed)
        userAddress, // user (indexed)
        userAddress // to (indexed)
      ),
      fromBlock
    );

    const transactions: AaveTransaction[] = [];
    let totalDeposited = BigInt(0);
    let totalWithdrawn = BigInt(0);

    for (const event of depositEvents) {
      const block = await event.getBlock();
      console.log("Raw deposit event:", event);

      const amount = event.args[3]; // amount is the 4th parameter
      totalDeposited += amount;

      transactions.push({
        type: "deposit",
        amount: ethers.formatUnits(amount, 6),
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        blockNumber: event.blockNumber,
      });
    }

    for (const event of withdrawEvents) {
      const block = await event.getBlock();
      console.log("Raw withdraw event:", event);

      const amount = event.args[3]; // amount is the 4th parameter
      totalWithdrawn += amount;

      transactions.push({
        type: "withdrawal",
        amount: ethers.formatUnits(amount, 6),
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        blockNumber: event.blockNumber,
      });
    }

    // Sort by block number (most recent first)
    transactions.sort((a, b) => b.blockNumber - a.blockNumber);

    // Get current balance
    const aUsdcContract = new ethers.Contract(
      AUSDC_ADDRESS,
      ["function balanceOf(address account) external view returns (uint256)"],
      signer
    );
    const currentBalance = await aUsdcContract.balanceOf(userAddress);

    // Calculate total income
    const totalIncome = currentBalance + totalWithdrawn - totalDeposited;

    return {
      transactions,
      totalDeposited: ethers.formatUnits(totalDeposited, 6),
      totalWithdrawn: ethers.formatUnits(totalWithdrawn, 6),
      currentBalance: ethers.formatUnits(currentBalance, 6),
      totalIncome: ethers.formatUnits(totalIncome, 6),
    };
  } catch (error) {
    console.error("Error getting Aave transaction history:", error);
    throw error; // This will help us see the actual error
  }
};

export default {
  getChainId,
  getAccounts,
  getBalance,
  sendTransaction,
  signMessage,
  getUsdcBalance,
  approveUsdcToAave,
  depositUsdc,
  getAaveUsdcBalance,
  withdrawFromAave,
  getAavePosition,
  getAaveTransactionHistory,
};
