import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Categories,
  LoginStatus,
  MessageResponse,
  MortgageAmortizationTable,
  MortgageLoan,
  MortgagePortfolio,
  PurchasedStock,
  PurchasedStocksCount,
  quote,
  RegularTransaction,
  SignUp,
  SoldStock,
  Stock,
  StockCompanyProfile,
  StockIdea,
  StockLogo,
  StockPrice,
  StockQuantity,
  StocksData,
  StockSummaryData,
  StockSummaryDataResponse,
  StonkStockPrice,
  Transaction,
  UserSettings,
} from '../models';
import { Observable, Subject, lastValueFrom } from 'rxjs';
import { SocialUser } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class GetService {
  isLogin!: boolean;
  isLogout: boolean = false;
  userId!: string;
  username!: string;
  firstname!: string;
  lastname!: string;
  isLogin$ = new Subject<boolean>();
  totalStockValue!: number;
  passStock!: PurchasedStock;
  applicationName: string = 'amapp';

  monthsString = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  constructor(private http: HttpClient) {}

  verifyLogin(username: string, password: string): Promise<LoginStatus> {
    let qp = new HttpParams()
      .set('username', username)
      .set('password', password);

    return lastValueFrom(
      this.http.get<LoginStatus>('/api/login', {
        params: qp,
        withCredentials: true,
      })
    );
  }

  checkLoginStatus(): Promise<LoginStatus> {
    return lastValueFrom(
      this.http.get<LoginStatus>('/api/isLogin', {
        withCredentials: true,
      })
    );
  }

  logout(): Promise<LoginStatus> {
    return lastValueFrom(
      this.http.get<LoginStatus>('/api/logout', {
        withCredentials: true,
      })
    );
  }

  getUserTheme(userId: string): Promise<UserSettings> {
    let qp = new HttpParams().set('userId', userId);
    return lastValueFrom(
      this.http.get<UserSettings>('/api/theme', {
        params: qp,
      })
    );
  }

  getUserGoalPromise(userId: string): Promise<UserSettings> {
    let qp = new HttpParams().set('userId', userId);
    return lastValueFrom(
      this.http.get<UserSettings>('/api/goal', {
        params: qp,
      })
    );
  }

  getUserGoal(userId: string): Observable<UserSettings> {
    let qp = new HttpParams().set('userId', userId);
    return this.http.get<UserSettings>('/api/goal', {
      params: qp,
    });
  }

  getStocks(symbol: string): Observable<StocksData> {
    let qp = new HttpParams().set('symbol', symbol);
    return this.http.get<StocksData>('/api/stocks', {
      params: qp,
    });
  }

  getStockLogo(symbol: string): Observable<StockLogo> {
    let qp = new HttpParams().set('symbol', symbol);
    return this.http.get<StockLogo>(`/api/${symbol}/logo`);
  }

  getStockPrice(symbol: string): Promise<Stock> {
    return lastValueFrom(this.http.get<Stock>(`/api/${symbol}/price`));
  }

  getStockPriceObservable(symbol: string): Observable<Stock> {
    return this.http.get<Stock>(`/api/${symbol}/price`);
  }

  getStonkStockPrice(symbol: string): Observable<StonkStockPrice> {
    let qp = new HttpParams().set('userId', this.userId);
    return this.http.get<StonkStockPrice>(`/api/${symbol}/stonkprice`, {
      params: qp,
    });
  }

  getUserStocksMongo(userId: string): Observable<PurchasedStock[]> {
    return this.http.get<PurchasedStock[]>(`/api/${userId}/stocks`);
  }

  getUserStocksMongoPromise(userId: string): Promise<PurchasedStock[]> {
    return lastValueFrom(
      this.http.get<PurchasedStock[]>(`/api/${userId}/stocks`)
    );
  }

  getUserSoldStocks(userId: string): Observable<SoldStock[]> {
    return this.http.get<SoldStock[]>(`/api/${userId}/sold_stocks`);
  }

  getUserStocksCount(userId: string): Observable<PurchasedStocksCount[]> {
    return this.http.get<PurchasedStocksCount[]>(`/api/${userId}/stocksCount`);
  }
  getUserStocksCountPromise(userId: string): Promise<PurchasedStocksCount[]> {
    return lastValueFrom(
      this.http.get<PurchasedStocksCount[]>(`/api/${userId}/stocksCount`)
    );
  }

  getUserTotalStockValuePromise(userId: string): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.get<MessageResponse>(`/api/${userId}/stocksValue`)
    );
  }

  getUserTotalStockValue(userId: string): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(`/api/${userId}/stocksValue`);
  }

  getUserYesterdayTotalStockValue(userId: string): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(
      `/api/${userId}/yesterday_stock_value`
    );
  }

  triggerUpdateUsersStockValue(): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(
      '/api/update_all_yesterday_stock_value'
    );
  }

  getStockMonthlyPricePromise(
    symbol: string,
    sdate: string,
    edate: string
  ): Promise<StockPrice[]> {
    let qp = new HttpParams().set('sdate', sdate).append('edate', edate);

    return lastValueFrom(
      this.http.get<StockPrice[]>(`/api/${symbol}/monthly_price`, {
        params: qp,
      })
    );
  }

  getStockMonthlyPrice(
    symbol: string,
    sdate: string,
    edate: string
  ): Observable<StockPrice[]> {
    let qp = new HttpParams().set('sdate', sdate).append('edate', edate);

    return this.http.get<StockPrice[]>(`/api/${symbol}/monthly_price`, {
      params: qp,
    });
  }

  getUserStockByMonth(
    userId: string,
    month: string,
    year: number
  ): Observable<PurchasedStock[]> {
    let qp = new HttpParams().set('month', month).append('year', year);
    return this.http.get<PurchasedStock[]>(`/api/${userId}/stocks_by_month`, {
      params: qp,
    });
  }

  getStockQtyByMonth(
    userId: string,
    month: string,
    symbol: string
  ): Observable<StockQuantity> {
    let qp = new HttpParams().set('month', month).append('symbol', symbol);
    return this.http.get<StockQuantity>(`/api/${userId}/stock_qty_month`, {
      params: qp,
    });
  }

  getUserMonthlyPerformance(
    userId: string,
    year: number
  ): Observable<number[]> {
    let qp = new HttpParams().set('year', year);
    return this.http.get<number[]>(`/api/${userId}/monthly_performance`, {
      params: qp,
    });
  }

  getUserStockMonthlyValue(userId: string, year: number): Observable<number[]> {
    let qp = new HttpParams().set('year', year);
    return this.http.get<number[]>(`/api/${userId}/stock_monthly_value`, {
      params: qp,
    });
  }

  getUserCategories(userId: string): Observable<Categories[]> {
    return this.http.get<Categories[]>(`/api/${userId}/categories`);
  }

  getUserAllTransaction(userId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`/api/${userId}/all_trans`);
  }

  getUserTransaction(userId: string, year: string): Observable<Transaction[]> {
    let qp = new HttpParams().set('year', year);
    return this.http.get<Transaction[]>(`/api/${userId}/transactions`, {
      params: qp,
    });
  }

  getUserTransactionBasedOnMonthYear(
    userId: string,
    month: string,
    year: string
  ): Observable<Transaction[]> {
    const qp = new HttpParams().set('month', month).append('year', year);
    return this.http.get<Transaction[]>(`/api/${userId}/trans_month_year`, {
      params: qp,
    });
  }

  getUserTransactionBasedOnDates(
    userId: string,
    startDate: string,
    endDate: string
  ): Observable<Transaction[]> {
    const qp = new HttpParams()
      .set('startDate', startDate)
      .append('endDate', endDate);
    return this.http.get<Transaction[]>(`/api/${userId}/trans_dates`, {
      params: qp,
    });
  }

  getQuoteOfTheDay(): Promise<quote[]> {
    return lastValueFrom(this.http.get<quote[]>('/api/quote'));
  }

  getCaptcha(username: string, email: string): Promise<MessageResponse> {
    const qp = new HttpParams()
      .set('username', username)
      .append('email', email);
    return lastValueFrom(
      this.http.get<MessageResponse>('/api/sign_up/captcha', {
        params: qp,
        withCredentials: true,
      })
    );
  }

  getUserProfile(userId: string): Promise<SignUp> {
    return lastValueFrom(this.http.get<SignUp>(`/api/${userId}/user_profile`));
  }

  getMortgageLoanData(
    amount: number,
    term: number,
    interest: number,
    typeOfTerm: string
  ): Promise<MortgageLoan> {
    const qp = new HttpParams()
      .set('amount', amount)
      .append('term', term)
      .append('interest', interest)
      .append('typeOfTerm', typeOfTerm);
    return lastValueFrom(
      this.http.get<MortgageLoan>('/api/calculate_mortgage', { params: qp })
    );
  }

  getMortgageAmortizationTable(
    amount: number,
    term: number,
    interest: number,
    typeOfTerm: string
  ): Promise<MortgageAmortizationTable[]> {
    const qp = new HttpParams()
      .set('amount', amount)
      .append('term', term)
      .append('interest', interest)
      .append('typeOfTerm', typeOfTerm);
    return lastValueFrom(
      this.http.get<MortgageAmortizationTable[]>('/api/amortization_mortgage', {
        params: qp,
      })
    );
  }

  getUserMortgagePortfolio(userId: string): Observable<MortgagePortfolio[]> {
    return this.http.get<MortgagePortfolio[]>(
      `/api/${userId}/mortgage_portfolio`
    );
  }

  getUserRegularTransactions(userId: string): Observable<RegularTransaction[]> {
    return this.http.get<RegularTransaction[]>(
      `/api/${userId}/all_regular_trans`
    );
  }

  getStockCompanyProfile(
    symbol: string,
    stockName: string
  ): Observable<StockCompanyProfile> {
    const qp = new HttpParams().set('stockName', stockName);
    return this.http.get<StockCompanyProfile>(
      `/api/${symbol}/company_profile`,
      { params: qp }
    );
  }

  getStockSummaryData(symbol: string): Observable<StockSummaryDataResponse> {
    return this.http.get<StockSummaryDataResponse>(
      `/api/${symbol}/stock_summary_data`
    );
  }

  getStockIdeas(
    symbol: string,
    limit: number,
    skip: number
  ): Observable<StockIdea[]> {
    const qp = new HttpParams().set('limit', limit).append('skip', skip);
    return this.http.get<StockIdea[]>(`/api/${symbol}/ideas`, { params: qp });
  }

  //NOTE EXTRA
  initiateLoginProcedure(loginStatus: LoginStatus) {
    this.userId = loginStatus.userId;
    this.isLogin = loginStatus.isLogin;
    this.username = loginStatus.username;
    this.firstname = loginStatus.firstname;
    this.lastname = loginStatus.lastname;
    this.isLogin$.next(true);
    localStorage.setItem('isLogin', 'true');
    localStorage.setItem('userId', loginStatus.userId);
    localStorage.setItem('username', loginStatus.username);
    localStorage.setItem('firstname', loginStatus.firstname);
    localStorage.setItem('lastname', loginStatus.lastname);
    localStorage.setItem('profileIcon', loginStatus.profileIcon);
  }

  initiateGoogleLoginProcedure(googleUser: SocialUser) {
    this.isLogin = true;
    this.userId = googleUser.id;
    this.username = googleUser.name;
    this.firstname = googleUser.firstName;
    this.lastname = googleUser.lastName;
    this.isLogin$.next(true);
    localStorage.setItem('isLogin', 'true');
    localStorage.setItem('userId', googleUser.id);
    localStorage.setItem('username', googleUser.name);
    localStorage.setItem('firstname', googleUser.firstName);
    localStorage.setItem('lastname', googleUser.lastName);
    localStorage.setItem('profileIcon', googleUser.photoUrl);
  }

  getStartDateOfYear(): string {
    const cuurDate = new Date();
    const currentYear = cuurDate.getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const formattedDate = `${startOfYear.getFullYear()}-${(
      startOfYear.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${startOfYear.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  getStartDateByYear(year: number): string {
    const startDate = new Date(year, 0, 1);

    const formattedDate = `${startDate.getFullYear()}-${(
      startDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  getEndDateByYear(year: number): string {
    const month = 11; // 0 is january
    const firstDayOfNextMonth = new Date(year, month + 1, 1);
    const endDate = new Date(firstDayOfNextMonth.getTime() - 1);

    const formattedDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  getEndOfMonth(months: string[], month: string): string {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = months.indexOf(month);

    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const endOfMonthDate = endOfMonth.getDate();

    for (let i = endOfMonthDate; i >= 1; i--) {
      const tempDate = new Date(currentYear, currentMonth, i);
      const dayOfWeek = tempDate.getDay();

      // 0 represents Sunday and 6 represents Saturday
      if (dayOfWeek > 0 && dayOfWeek < 6) {
        // const formattedDate = tempDate.toISOString().split('T')[0];
        const formattedDate = `${tempDate.getFullYear()}-${(
          tempDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${tempDate.getDate().toString().padStart(2, '0')}`;
        return formattedDate;
      }
    }
    return ''; // No suitable date found (unlikely scenario)
  }

  getCurrentTime(): string {
    const currTime = new Date();
    const hours = currTime.getHours();
    // console.log('curr hour', hours);
    if (hours < 12) {
      return 'Good Morning';
    } else if (hours >= 12 && hours < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }

  getCurrentDate(): string {
    const currDate = new Date();
    // const yesterdayDate = new Date(currDate);
    // yesterdayDate.setDate(currDate.getDate() - 1);

    while (
      currDate.getDay() === 1 ||
      currDate.getDay() === 0 ||
      currDate.getDay() === 6
    ) {
      currDate.setDate(currDate.getDate() - 1);
      // console.log('currDate2', currDate);
    }
    const formattedDate = `${currDate.getFullYear()}-${(currDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currDate.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  getEndOfMonthFinal(): string[] {
    const months = this.monthsString;
    let endOfMonth: string[] = [];
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const endDate = this.getEndOfMonth(months, month);
      endOfMonth.push(endDate);
    }

    const today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    const formattedDate = `${yesterday.getFullYear()}-${(
      yesterday.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;
    endOfMonth.push(formattedDate);

    // include yesterday date
    return endOfMonth;
  }

  getColors(index: number): string {
    const colors: string[] = [
      '#c2f0c6',
      '#74aff3',
      '#eed69a',
      '#b7b3ea',
      '#a8c280',
      '#e1b0dd',
      '#95cfa2',
      '#edaab4',
      '#79ddcb',
      '#e8b594',
      '#7cccee',
      '#bfbb81',
      '#b0c3ec',
      '#deeaaf',
      '#65cfd8',
      '#cec7a1',
      '#a7ede8',
      '#8bb598',
      '#8dc3b8',
      '#a5d1b3',
    ];

    return colors[index];
  }
}
