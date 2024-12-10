export const NATIVE_VAULT_ABI = [
  // View Functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function getCash() view returns (uint256)',
  'function exchangeRateStored() view returns (uint256)',
  'function accrualBlockTimestamp() view returns (uint256)',
  'function totalBorrows() view returns (uint256)',
  'function totalReserves() view returns (uint256)',
  'function borrowIndex() view returns (uint256)',
  'function borrowRatePerTimestamp() view returns (uint256)',
  'function supplyRatePerTimestamp() view returns (uint256)',
  'function underlying() view returns (address)',
  'function netSwapBorrow() view returns (int256)',
  'function swapBorrowReserve() view returns (uint256)',
  
  // State-Changing Functions
  'function mint(uint256 mintAmount) returns (uint256)',
  'function redeem(uint256 redeemTokens) returns (uint256)',
  'function redeemUnderlying(uint256 redeemAmount) returns (uint256)',
  'function borrow(uint256 borrowAmount) returns (uint256)',
  'function repayBorrow(uint256 repayAmount) returns (uint256)',
  'function repayBorrowBehalf(address borrower, uint256 repayAmount) returns (uint256)',
  'function liquidateBorrow(address borrower, uint256 repayAmount, address cTokenCollateral) returns (uint256)',
  'function transfer(address dst, uint256 amount) returns (bool)',
  'function transferFrom(address src, address dst, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  
  // Price Update Functions
  'function updatePrices(address[] tokens, bytes32[] priceIds, bytes[] data) payable',
  'function updatePricesAndBorrow(uint256 borrowAmount, address[] tokens, bytes32[] priceIds, bytes[] data) payable returns (uint256)',
  'function updatePricesAndRedeem(uint256 redeemTokens, address[] tokens, bytes32[] priceIds, bytes[] data) payable returns (uint256)',
  'function updatePricesAndRedeemUnderlying(uint256 redeemAmount, address[] tokens, bytes32[] priceIds, bytes[] data) payable returns (uint256)',
  'function updatePricesAndLiquidateBorrow(address borrower, uint256 repayAmount, address cTokenCollateral, address[] tokens, bytes32[] priceIds, bytes[] data) payable returns (uint256)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 amount)',
  'event Approval(address indexed owner, address indexed spender, uint256 amount)',
  'event Mint(address minter, uint256 mintAmount, uint256 mintTokens)',
  'event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens)',
  'event Borrow(address borrower, uint256 borrowAmount, uint256 accountBorrows, uint256 totalBorrows)',
  'event RepayBorrow(address payer, address borrower, uint256 repayAmount, uint256 accountBorrows, uint256 totalBorrows)',
  'event LiquidateBorrow(address liquidator, address borrower, uint256 repayAmount, address cTokenCollateral, uint256 seizeTokens)'
]; 