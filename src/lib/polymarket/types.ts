export interface ActivityItem {
  proxyWallet: string;
  timestamp: number; // Unix seconds
  conditionId: string;
  type: "TRADE" | "REDEEM" | "SPLIT" | "MERGE" | "REWARD" | string;
  size: number;
  usdcSize: number;
  transactionHash: string;
  price: number;
  asset: string;
  side: "BUY" | "SELL" | string;
  outcomeIndex: number;
  title: string;
  slug: string;
  icon: string;
  outcome: string;
}

export interface Position {
  proxyWallet: string;
  asset: string;
  conditionId: string;
  size: number;        // number of shares
  curPrice: number;   // current price 0-1
  avgPrice: number;
  initialValue: number;
  currentValue: number;
  cashPnl: number;    // realized P&L in USD
  percentPnl: number;
  totalBought: number;
  realizedPnl: number;
  redeemable: boolean;
  mergeable: boolean;
  title: string;
  slug: string;
  icon: string;
  outcome: string;
  outcomeIndex: number;
  endDate: string;
  negativeRisk: boolean;
}

export interface PortfolioValue {
  value: number;
}

export interface DailyPnL {
  date: string;
  realizedPnl: number;
  cumulativePnl: number;
  volume: number;
}

export interface WinLossStat {
  wins: number;
  losses: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
}
