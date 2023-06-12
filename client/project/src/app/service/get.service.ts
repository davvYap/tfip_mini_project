import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  LoginStatus,
  MessageResponse,
  PurchasedStock,
  PurchasedStocksCount,
  Stock,
  StockPrice,
  StocksData,
  StonkStockPrice,
  UserSettings,
} from '../models';
import { Observable, Subject, last, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetService {
  isLogin!: boolean;
  isLogout: boolean = false;
  userId!: string;
  isLogin$ = new Subject<boolean>();
  totalStockValue!: number;

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

  getUserGoal(userId: string): Promise<UserSettings> {
    let qp = new HttpParams().set('userId', userId);
    return lastValueFrom(
      this.http.get<UserSettings>('http://localhost:8080/api/goal', {
        params: qp,
      })
    );
  }

  getStocks(symbol: string): Observable<StocksData> {
    let qp = new HttpParams().set('symbol', symbol);
    return this.http.get<StocksData>('http://localhost:8080/api/stocks', {
      params: qp,
    });
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

  getUserStocksCount(userId: string): Observable<PurchasedStocksCount[]> {
    return this.http.get<PurchasedStocksCount[]>(
      `http://localhost:8080/api/${userId}/stocksCount`
    );
  }

  getUserTotalStockValue(userId: string): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.get<MessageResponse>(
        `http://localhost:8080/api/${userId}/stocksValue`
      )
    );
  }

  getStockMonthlyPrice(
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
}
