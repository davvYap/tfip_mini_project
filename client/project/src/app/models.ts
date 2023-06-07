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

export interface PurchasedStock {
  symbol: string;
  price: string;
  quantity: string;
  fees: string;
  date: number;
  name: string;
}

export interface UserTheme {
  theme: string;
}

export interface MessageResponse {
  message: string;
}
