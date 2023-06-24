import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageResponse, PurchasedStock, Transaction } from '../models';
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
}
