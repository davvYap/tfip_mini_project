export interface LoginStatus {
  isLogin: boolean;
  userId: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
}

export interface PurchasedStock {
  symbol: string;
  price: string;
  quantity: string;
  fees: string;
  date: string;
  name: string;
}

export interface UserTheme {
  theme: string;
}

export interface MessageResponse {
  message: string;
}
