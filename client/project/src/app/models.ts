export interface SignUp {
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
}

export interface LoginStatus {
  isLogin: boolean;
  userId: string;
  username: string;
  firstname: string;
  lastname: string;
  profileIcon: string;
}

export interface Stock {
  symbol: string;
  instrument_name: string;
  exchange: string;
  currency: string;
  price: string;
}

export interface StockDayPerformance {
  dayPerformance: number;
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
  dayPerformance: number;
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

export interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

export interface ExportColumn {
  title: string;
  dataKey: string;
}

export interface Categories {
  categoryId: number;
  categoryName: string;
  type: string;
  total: number;
}

export interface Transaction {
  transactionId: string;
  transactionName: string;
  type: string;
  date: string;
  amount: number;
  remarks: string;
  categoryName: string;
  categoryId: string;
  dateNum: number;
  regular: boolean;
}

export interface SimpleTransaction {
  categoryName: string;
  amount: number;
}

export interface categoryOptionItem<T = any> {
  label: string;
  value: string;
  object: T;
}

export interface quote {
  q: string;
  a: string;
  h: string;
}

export interface GoogleUser {
  userId: string;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  email: string;
}

export interface MortgageLoan {
  principal: number;
  totalInterest: number;
  monthlyRepayment: number;
}

export interface MortgageAmortizationTable {
  year: number;
  principal: number;
  interest: number;
  repayment: number;
  totalInterestPaid: number;
  balanceRemaining: number;
}

export interface MortgagePortfolio {
  id: string;
  loanAmount: number;
  interest: number;
  totalRepayment: number;
  monthlyRepayment: number;
  totalPeriod: number;
  imgString: string;
  new: boolean;
}

export interface NotificationMessage {
  notificationNumber: number;
  month: string;
  benchmark: number;
  performance: number;
  message: string;
  styleClass: string;
  performanceType: string;
}

export interface RegularTransaction {
  id: string;
  tran: Transaction;
  active: boolean;
}

export interface StockCompanyProfile {
  symbol: string;
  sector: string;
  industry: string;
  fulltimeEmployees: number;
  website: string;
  longBusinessSummary: string;
  companyOfficers: CompanyOfficers[];
  country: string;
  // need to add our own
  name: string;
  logo: string;
  closePrice: number;
  stockSummaryData: StockSummaryData;
  dayPerformance: number;
}

export interface CompanyOfficers {
  name: string;
  age: number;
  title: string;
}

export interface StockSummaryData {
  marketCap: number;
  volume: number;
  trailingPE: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
}

export interface StockSummaryDataResponse {
  summaryDetail: StockSummaryData;
}

export interface StockIdea {
  id: string;
  userId: string;
  fullName: string;
  profileIcon: string;
  sentiment: number;
  idea: string;
  date: number;
}

export interface StockScreen {
  name: string;
  symbol: string;
}

export interface PaymentInfo {
  paymentId: string;
  fullName: string;
  email: string;
  address: string;
  amount: string;
  currencyCode: string;
}

export interface StockMonthlyPrice {
  firstClosePrice: number;
  monthlyPrices: number[];
}
