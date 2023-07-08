import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Categories,
  LoginStatus,
  MessageResponse,
  PurchasedStock,
  PurchasedStocksCount,
  quote,
  SoldStock,
  Stock,
  StockLogo,
  StockPrice,
  StockQuantity,
  StocksData,
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
  applicationName: string = 'ap.app';

  constructor(private http: HttpClient) {}

  verifyLogin(username: string, password: string): Promise<LoginStatus> {
    let qp = new HttpParams()
      .set('username', username)
      .set('password', password);

    return lastValueFrom(
      this.http.get<LoginStatus>('http://localhost:8080/api/login', {
        params: qp,
        withCredentials: true,
      })
    );
  }

  checkLoginStatus(): Promise<LoginStatus> {
    return lastValueFrom(
      this.http.get<LoginStatus>('http://localhost:8080/api/isLogin', {
        withCredentials: true,
      })
    );
  }

  logout(): Promise<LoginStatus> {
    return lastValueFrom(
      this.http.get<LoginStatus>('http://localhost:8080/api/logout', {
        withCredentials: true,
      })
    );
  }

  getUserTheme(userId: string): Promise<UserSettings> {
    let qp = new HttpParams().set('userId', userId);
    return lastValueFrom(
      this.http.get<UserSettings>('http://localhost:8080/api/theme', {
        params: qp,
      })
    );
  }

  getUserGoalPromise(userId: string): Promise<UserSettings> {
    let qp = new HttpParams().set('userId', userId);
    return lastValueFrom(
      this.http.get<UserSettings>('http://localhost:8080/api/goal', {
        params: qp,
      })
    );
  }

  getUserGoal(userId: string): Observable<UserSettings> {
    let qp = new HttpParams().set('userId', userId);
    return this.http.get<UserSettings>('http://localhost:8080/api/goal', {
      params: qp,
    });
  }

  getStocks(symbol: string): Observable<StocksData> {
    let qp = new HttpParams().set('symbol', symbol);
    return this.http.get<StocksData>('http://localhost:8080/api/stocks', {
      params: qp,
    });
  }

  getStockLogo(symbol: string): Observable<StockLogo> {
    let qp = new HttpParams().set('symbol', symbol);
    return this.http.get<StockLogo>(`http://localhost:8080/api/${symbol}/logo`);
  }

  getStockPrice(symbol: string): Promise<Stock> {
    return lastValueFrom(
      this.http.get<Stock>(`http://localhost:8080/api/${symbol}/price`)
    );
  }

  getStonkStockPrice(symbol: string): Observable<StonkStockPrice> {
    let qp = new HttpParams().set('userId', this.userId);
    return this.http.get<StonkStockPrice>(
      `http://localhost:8080/api/${symbol}/stonkprice`,
      { params: qp }
    );
  }

  getUserStocksMongo(userId: string): Observable<PurchasedStock[]> {
    return this.http.get<PurchasedStock[]>(
      `http://localhost:8080/api/${userId}/stocks`
    );
  }

  getUserStocksMongoPromise(userId: string): Promise<PurchasedStock[]> {
    return lastValueFrom(
      this.http.get<PurchasedStock[]>(
        `http://localhost:8080/api/${userId}/stocks`
      )
    );
  }

  getUserSoldStocks(userId: string): Observable<SoldStock[]> {
    return this.http.get<SoldStock[]>(
      `http://localhost:8080/api/${userId}/sold_stocks`
    );
  }

  getUserStocksCount(userId: string): Observable<PurchasedStocksCount[]> {
    return this.http.get<PurchasedStocksCount[]>(
      `http://localhost:8080/api/${userId}/stocksCount`
    );
  }
  getUserStocksCountPromise(userId: string): Promise<PurchasedStocksCount[]> {
    return lastValueFrom(
      this.http.get<PurchasedStocksCount[]>(
        `http://localhost:8080/api/${userId}/stocksCount`
      )
    );
  }

  getUserTotalStockValuePromise(userId: string): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.get<MessageResponse>(
        `http://localhost:8080/api/${userId}/stocksValue`
      )
    );
  }

  getUserTotalStockValue(userId: string): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(
      `http://localhost:8080/api/${userId}/stocksValue`
    );
  }

  getUserYesterdayTotalStockValue(userId: string): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(
      `http://localhost:8080/api/${userId}/yesterday_stock_value`
    );
  }

  triggerUpdateUsersStockValue(): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(
      'http://localhost:8080/api/update_all_yesterday_stock_value'
    );
  }

  getStockMonthlyPricePromise(
    symbol: string,
    sdate: string,
    edate: string
  ): Promise<StockPrice[]> {
    let qp = new HttpParams().set('sdate', sdate).append('edate', edate);

    return lastValueFrom(
      this.http.get<StockPrice[]>(
        `http://localhost:8080/api/${symbol}/monthly_price`,
        { params: qp }
      )
    );
  }

  getStockMonthlyPrice(
    symbol: string,
    sdate: string,
    edate: string
  ): Observable<StockPrice[]> {
    let qp = new HttpParams().set('sdate', sdate).append('edate', edate);

    return this.http.get<StockPrice[]>(
      `http://localhost:8080/api/${symbol}/monthly_price`,
      { params: qp }
    );
  }

  getUserStockByMonth(
    userId: string,
    month: string
  ): Observable<PurchasedStock[]> {
    let qp = new HttpParams().set('month', month);
    return this.http.get<PurchasedStock[]>(
      `http://localhost:8080/api/${userId}/stocks_by_month`,
      { params: qp }
    );
  }

  getStockQtyByMonth(
    userId: string,
    month: string,
    symbol: string
  ): Observable<StockQuantity> {
    let qp = new HttpParams().set('month', month).append('symbol', symbol);
    return this.http.get<StockQuantity>(
      `http://localhost:8080/api/${userId}/stock_qty_month`,
      { params: qp }
    );
  }

  getUserMonthlyPerformance(
    userId: string,
    year: number
  ): Observable<number[]> {
    let qp = new HttpParams().set('year', year);
    return this.http.get<number[]>(
      `http://localhost:8080/api/${userId}/monthly_performance`,
      { params: qp }
    );
  }

  getUserStockMonthlyValue(userId: string, year: number): Observable<number[]> {
    let qp = new HttpParams().set('year', year);
    return this.http.get<number[]>(
      `http://localhost:8080/api/${userId}/stock_monthly_value`,
      { params: qp }
    );
  }

  getUserCategories(userId: string): Observable<Categories[]> {
    return this.http.get<Categories[]>(
      `http://localhost:8080/api/${userId}/categories`
    );
  }

  getUserAllTransaction(userId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `http://localhost:8080/api/${userId}/all_trans`
    );
  }

  getUserTransaction(userId: string, year: string): Observable<Transaction[]> {
    let qp = new HttpParams().set('year', year);
    return this.http.get<Transaction[]>(
      `http://localhost:8080/api/${userId}/transactions`,
      { params: qp }
    );
  }

  getUserTransactionBasedOnMonthYear(
    userId: string,
    month: string,
    year: string
  ): Observable<Transaction[]> {
    const qp = new HttpParams().set('month', month).append('year', year);
    return this.http.get<Transaction[]>(
      `http://localhost:8080/api/${userId}/trans_month_year`,
      { params: qp }
    );
  }

  getUserTransactionBasedOnDates(
    userId: string,
    startDate: string,
    endDate: string
  ): Observable<Transaction[]> {
    const qp = new HttpParams()
      .set('startDate', startDate)
      .append('endDate', endDate);
    return this.http.get<Transaction[]>(
      `http://localhost:8080/api/${userId}/trans_dates`,
      { params: qp }
    );
  }

  getQuoteOfTheDay(): Promise<quote[]> {
    return lastValueFrom(
      this.http.get<quote[]>('http://localhost:8080/api/quote')
    );
  }

  getCaptcha(username: string, email: string): Promise<MessageResponse> {
    const qp = new HttpParams()
      .set('username', username)
      .append('email', email);
    return lastValueFrom(
      this.http.get<MessageResponse>(
        'http://localhost:8080/api/sign_up/captcha',
        {
          params: qp,
          withCredentials: true,
        }
      )
    );
  }

  // EXTRA
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
