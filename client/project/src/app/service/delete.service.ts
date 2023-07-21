import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageResponse, MortgagePortfolio } from '../models';
import { lastValueFrom } from 'rxjs';
import { Transaction } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DeleteService {
  // api: string = 'http://localhost:8080/api';
  api: string = '/api';

  constructor(private http: HttpClient) {}

  deleteStockWithPurchaseId(
    purchaseId: string,
    userId: string
  ): Promise<MessageResponse> {
    const qp = new HttpParams().set('purchaseId', purchaseId);
    return lastValueFrom(
      this.http.delete<MessageResponse>(
        `${this.api}/${userId}/delete_stock_purchaseId`,
        { params: qp }
      )
    );
  }

  deleteStockWithSymbol(
    symbol: string,
    userId: string
  ): Promise<MessageResponse> {
    const qp = new HttpParams().set('symbol', symbol);
    return lastValueFrom(
      this.http.delete<MessageResponse>(
        `${this.api}/${userId}/delete_stock_symbol`,
        {
          params: qp,
        }
      )
    );
  }

  deleteTransaction(
    userId: string,
    tran: Transaction
  ): Promise<MessageResponse> {
    const qp = new HttpParams()
      .set('tranId', tran.transactionId)
      .append('catName', tran.categoryName);
    return lastValueFrom(
      this.http.delete<MessageResponse>(
        `${this.api}/${userId}/delete_transaction`,
        {
          params: qp,
        }
      )
    );
  }

  deleteMortgagePortfolio(
    userId: string,
    mortgageId: string
  ): Promise<MessageResponse> {
    const qp = new HttpParams().set('mortgageId', mortgageId);
    return lastValueFrom(
      this.http.delete<MessageResponse>(
        `${this.api}/${userId}/delete_mortgage_portfolio`,
        { params: qp }
      )
    );
  }

  deleteRegularTransaction(
    userId: string,
    regTranId: string,
    regTranName: string
  ): Promise<MessageResponse> {
    const qp = new HttpParams()
      .set('regTranId', regTranId)
      .append('regTranName', regTranName);
    return lastValueFrom(
      this.http.delete<MessageResponse>(
        `${this.api}/${userId}/delete_regular_tran`,
        {
          params: qp,
        }
      )
    );
  }

  deleteStockIdea(symbol: string, ideaId: string): Promise<MessageResponse> {
    const qp = new HttpParams().set('ideaId', ideaId);
    return lastValueFrom(
      this.http.delete<MessageResponse>(`${this.api}/${symbol}/delete_idea`, {
        params: qp,
      })
    );
  }
}
