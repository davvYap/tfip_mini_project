import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageResponse } from '../models';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeleteService {
  constructor(private http: HttpClient) {}

  deleteStock(purchaseId: string, userId: string): Promise<MessageResponse> {
    const qp = new HttpParams().set('purchaseId', purchaseId);
    return lastValueFrom(
      this.http.delete<MessageResponse>(
        `http://localhost:8080/api/${userId}/delete_stock`,
        { params: qp }
      )
    );
  }
}
