import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  LoginStatus,
  MessageResponse,
  PurchasedStock,
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
      this.http.post<MessageResponse>(
        'http://localhost:8080/api/theme',
        data.toString(),
        {
          headers: httpheader,
        }
      )
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
      this.http.post<MessageResponse>(
        'http://localhost:8080/api/goal',
        data.toString(),
        {
          headers: httpheader,
        }
      )
    );
  }

  addStock(userId: string, stock: PurchasedStock): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(
        `http://localhost:8080/api/${userId}/addStock`,
        stock
      )
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
      `http://localhost:8080/api/${userId}/add_category`,
      data.toString(),
      { headers: httpHearders }
    );
  }

  addTransaction(userId: string, tran: Transaction): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.post<MessageResponse>(
        `http://localhost:8080/api/${userId}/add_transaction`,
        tran
      )
    );
  }
}
