import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Categories,
  MessageResponse,
  MortgagePortfolio,
  PurchasedStock,
  Transaction,
} from '../models';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  constructor(private http: HttpClient) {}

  updateUserStock(
    userId: string,
    soldStock: PurchasedStock
  ): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.put<MessageResponse>(
        `http://localhost:8080/api/${userId}/update_stock`,
        soldStock
      )
    );
  }

  updateTransaction(
    userId: string,
    tran: Transaction
  ): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.put<MessageResponse>(
        `http://localhost:8080/api/${userId}/update_transaction`,
        tran
      )
    );
  }

  updateCategory(userId: string, cat: Categories): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.put<MessageResponse>(
        `http://localhost:8080/api/${userId}/update_category`,
        cat
      )
    );
  }

  updateUserProfile(
    userId: string,
    formData: FormData
  ): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.put<MessageResponse>(
        `http://localhost:8080/api/${userId}/edit_profile`,
        formData
      )
    );
  }

  updateUserMortgagePortfolio(
    userId: string,
    mort: MortgagePortfolio
  ): Promise<MessageResponse> {
    return lastValueFrom(
      this.http.put<MessageResponse>(
        `http://localhost:8080/api/${userId}/update_mortgage_profile`,
        mort
      )
    );
  }
}
