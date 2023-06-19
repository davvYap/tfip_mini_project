export interface LoginStatus {
  isLogin: boolean;
  userId: string;
}

export interface Stock {
  symbol: string;
  instrument_name: string;
  exchange: string;
  currency: string;
  price: string;
}

export interface StockLogo {
  url: string;
}

export interface StocksData {
  data: Stock[];
}

export interface StonkStockPrice {
  price: number;
  total_vol: string;
  change_percentage: number;
}

export interface PurchasedStock {
  purchaseId: string;
  symbol: string;
  price: number;
  quantity: number;
  fees: number;
  date: number;
  name: string;
  marketPrice: number;
  percentage: number;
  logo: string;
}

export interface SoldStock {
  soldId: string;
  symbol: string;
  price: number;
  quantity: number;
  fees: number;
  date: number;
  name: string;
  netProfit: number;
  percentage: number;
  logo: string;
}

export interface PurchasedStocksCount {
  symbol: string;
  name: string;
  quantity: number;
  cost: number;
  marketPrice: number;
  performance: number;
  logo: string;
}
export interface UserSettings {
  theme: string;
  goal: number;
}

export interface MessageResponse {
  message: string;
  value: number;
}

export interface StockPrice {
  date: string;
  close: number;
  volume: number;
  symbol: string;
}

export interface StocksMonthlyPrice {
  symbol: string;
  marketPrice: number[];
}

export interface StocksMonthlyQuantity {
  symbol: string;
  quantity: number[];
}

export interface UserMonthlyCapital {
  month: string;
  capital: number;
}

export interface StockQuantity {
  quantity: number;
}
