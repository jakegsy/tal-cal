import { ethers } from 'ethers';

export function isValidEthereumAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

export function formatAddress(address: string): string {
  if (!isValidEthereumAddress(address)) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
}