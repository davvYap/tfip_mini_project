import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GoogleUser,
  LoginStatus,
  MessageResponse,
  MortgagePortfolio,
  PaymentInfo,
  PurchasedStock,
  SignUp,
  StockIdea,
  Transaction,
} from '../models';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  // api: string = 'http://localhost:8080/api';
  api: string = '/api';

  constructor(private http: HttpClient) {}

  updateUserTheme(userId: string, theme: string): Promise<MessageResponse> {
    let data = new HttpParams()
      .set('userId', userId)
      .append('userTheme', theme);

    const httpheader = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return lastValueFrom(
      this.http.post<MessageResponse>(`${this.api}/theme`, data.toString(), {
        headers: httpheader,
      })
    );
  }

  updateUserGoal(userId: string, goal: number): Promise<MessageResponse> {
    let data = new HttpParams()
      .set('userId', userId)
      .append('userGoal', goal.toString());

    const httpheader = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return lastValueFrom(
      this.http.post<MessageResponse>(`${this.api}/goal`, data.toString(), {
        headers: httpheader,
      })
    );
  }

  addStock(userId: string, stock: PurchasedStock): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(`${this.api}/${userId}/addStock`, stock)
    );
  }

  addCategory(
    userId: string,
    category: string,
    type: string
  ): Observable<MessageResponse> {
    let data = new HttpParams().set('category', category).append('type', type);
    const httpHearders = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http.post<MessageResponse>(
      `${this.api}/${userId}/add_category`,
      data.toString(),
      { headers: httpHearders }
    );
  }

  addTransaction(userId: string, tran: Transaction): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(
        `${this.api}/${userId}/add_transaction`,
        tran
      )
    );
  }

  signUp(formData: FormData): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(`${this.api}/sign_up`, formData, {
        withCredentials: true,
      })
    );
  }

  googleUserSignIn(user: GoogleUser): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(`${this.api}/google_user_sign_in`, user)
    );
  }

  addUserMortgagePortfolio(
    userId: string,
    mort: MortgagePortfolio
  ): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(
        `${this.api}/${userId}/add_mortgage_profile`,
        mort
      )
    );
  }

  newStockIdea(symbol: string, idea: StockIdea): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(`${this.api}/${symbol}/new_idea`, idea)
    );
  }

  updateUserStockScreenSearch(
    userId: string,
    symbol: string,
    name: string
  ): Promise<MessageResponse> {
    let data = new HttpParams().set('symbol', symbol).append('name', name);

    const httpheader = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return lastValueFrom(
      this.http.post<MessageResponse>(
        `${this.api}/${userId}/recent_stock_search`,
        data.toString(),
        {
          headers: httpheader,
        }
      )
    );
  }

  postUserPaymentPaypal(
    userId: string,
    payment: PaymentInfo
  ): Promise<MessageResponse> {
    let data = new HttpParams()
      .set('paymentId', payment.paymentId)
      .append('email', payment.email)
      .append('fullName', payment.fullName)
      .append('address', payment.address)
      .append('currencyCode', payment.currencyCode)
      .append('amount', payment.amount);

    const httpheader = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return lastValueFrom(
      this.http.post<MessageResponse>(
        `${this.api}/${userId}/payment`,
        data.toString(),
        {
          headers: httpheader,
        }
      )
    );
  }
}
