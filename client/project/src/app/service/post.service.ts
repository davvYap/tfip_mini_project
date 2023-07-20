import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GoogleUser,
  LoginStatus,
  MessageResponse,
  MortgagePortfolio,
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
      this.http.post<MessageResponse>('/api/theme', data.toString(), {
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
      this.http.post<MessageResponse>('/api/goal', data.toString(), {
        headers: httpheader,
      })
    );
  }

  addStock(userId: string, stock: PurchasedStock): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(`/api/${userId}/addStock`, stock)
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
      `/api/${userId}/add_category`,
      data.toString(),
      { headers: httpHearders }
    );
  }

  addTransaction(userId: string, tran: Transaction): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(`/api/${userId}/add_transaction`, tran)
    );
  }

  signUp(formData: FormData): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>('/api/sign_up', formData, {
        withCredentials: true,
      })
    );
  }

  googleUserSignIn(user: GoogleUser): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>('/api/google_user_sign_in', user)
    );
  }

  addUserMortgagePortfolio(
    userId: string,
    mort: MortgagePortfolio
  ): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(
        `/api/${userId}/add_mortgage_profile`,
        mort
      )
    );
  }

  newStockIdea(symbol: string, idea: StockIdea): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(`/api/${symbol}/new_idea`, idea)
    );
  }
}
