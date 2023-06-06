import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoginStatus, Stock, UserTheme } from '../models';
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

  getStocks(): Stock[] {
    return [
      {
        symbol: 'AAPL',
        name: 'APPLE',
        price: 182,
      },
      {
        symbol: 'MSFT',
        name: 'MICROSOFT',
        price: 290,
      },
      {
        symbol: 'AMZN',
        name: 'AMAZON',
        price: 232,
      },
      {
        symbol: 'TSM',
        name: 'TAIWAN SEMICONDUCTOR MANUFACTURING CO., LTD.',
        price: 98,
      },
      {
        symbol: 'META',
        name: 'META ',
        price: 298,
      },
    ];
  }
}
