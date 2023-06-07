import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoginStatus, Stock, StocksData, UserTheme } from '../models';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetService {
  isLogin!: boolean;
  isLoginRecently: boolean = false;
  userId!: string;

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
}
