import { ethers } from 'ethers';
import { NATIVE_VAULT_ABI } from '../contracts/nativeVault';
import { ethereumService } from './ethereum';

export interface VaultData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  exchangeRate: bigint;
  totalBorrows: bigint;
  totalReserves: bigint;
  borrowRate: bigint;
  supplyRate: bigint;
  underlying: string;
  cash: bigint;
}

export interface BorrowData {
  borrowBalance: bigint;
  borrowIndex: bigint;
}

class NativeVaultService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = ethereumService.getProvider();
  }

  async getVaultData(vaultAddress: string): Promise<VaultData> {
    const vaultContract = new ethers.Contract(
      vaultAddress,
      NATIVE_VAULT_ABI,
      this.provider
    );

    const [
      name,
      symbol,
      decimals,
      totalSupply,
      exchangeRate,
      totalBorrows,
      totalReserves,
      borrowRate,
      supplyRate,
      underlying,
      cash,
    ] = await Promise.all([
      vaultContract.name(),
      vaultContract.symbol(),
      vaultContract.decimals(),
      vaultContract.totalSupply(),
      vaultContract.exchangeRateStored(),
      vaultContract.totalBorrows(),
      vaultContract.totalReserves(),
      vaultContract.borrowRatePerTimestamp(),
      vaultContract.supplyRatePerTimestamp(),
      vaultContract.underlying(),
      vaultContract.getCash(),
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply,
      exchangeRate,
      totalBorrows,
      totalReserves,
      borrowRate,
      supplyRate,
      underlying,
      cash,
    };
  }

  async getBorrowData(vaultAddress: string, account: string): Promise<BorrowData> {
    const vaultContract = new ethers.Contract(
      vaultAddress,
      NATIVE_VAULT_ABI,
      this.provider
    );

    const [borrowBalance, borrowIndex] = await Promise.all([
      vaultContract.borrowBalanceStored(account),
      vaultContract.borrowIndex(),
    ]);

    return {
      borrowBalance,
      borrowIndex,
    };
  }

  async updatePricesAndBorrow(
    vaultAddress: string,
    borrowAmount: bigint,
    tokens: string[],
    priceIds: string[],
    data: string[],
    signer: ethers.Signer
  ): Promise<ethers.ContractTransactionResponse> {
    const vaultContract = new ethers.Contract(
      vaultAddress,
      NATIVE_VAULT_ABI,
      signer
    );

    return vaultContract.updatePricesAndBorrow(
      borrowAmount,
      tokens,
      priceIds,
      data
    );
  }

  async updatePricesAndRedeem(
    vaultAddress: string,
    redeemTokens: bigint,
    tokens: string[],
    priceIds: string[],
    data: string[],
    signer: ethers.Signer
  ): Promise<ethers.ContractTransactionResponse> {
    const vaultContract = new ethers.Contract(
      vaultAddress,
      NATIVE_VAULT_ABI,
      signer
    );

    return vaultContract.updatePricesAndRedeem(
      redeemTokens,
      tokens,
      priceIds,
      data
    );
  }

  async mint(
    vaultAddress: string,
    mintAmount: bigint,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransactionResponse> {
    const vaultContract = new ethers.Contract(
      vaultAddress,
      NATIVE_VAULT_ABI,
      signer
    );

    return vaultContract.mint(mintAmount);
  }
}

export const nativeVaultService = new NativeVaultService(); 