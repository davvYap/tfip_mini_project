import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  LoginStatus,
  MessageResponse,
  PurchasedStock,
  PurchasedStocksCount,
  Stock,
  StocksData,
  StonkStockPrice,
  UserTheme,
} from '../models';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetService {
  isLogin!: boolean;
  isLoginRecently: boolean = false;
  userId!: string;
  totalStockValue!: number;
  dashBoardYearlyGoalData: number[] = [
    10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
  ];

  constructor(private http: HttpClient) {}

  getdashBoardYearlyGoalData(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.dashBoardYearlyGoalData);
      }, 1000);
    });
  }

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

  getUserTheme(userId: string): Promise<UserTheme> {
    let qp = new HttpParams().set('userId', userId);
    return lastValueFrom(
      this.http.get<UserTheme>('http://localhost:8080/api/theme', {
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
}
