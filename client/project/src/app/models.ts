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

export interface StocksData {
  data: Stock[];
}

export interface StonkStockPrice {
  price: number;
  total_vol: string;
  change_percentage: number;
}

export interface PurchasedStock {
  symbol: string;
  price: number;
  quantity: number;
  fees: number;
  date: number;
  name: string;
}

export interface PurchasedStocksCount {
  symbol: string;
  name: string;
  quantity: number;
  cost: number;
  marketPrice: number;
  performance: number;
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
