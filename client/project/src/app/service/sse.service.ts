import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SseService {
  private eventSource!: EventSource;
  constructor(private http: HttpClient) {}

  public getStockRealTimePrice(symbol: string): Observable<string> {
    console.log('new sse connection...', symbol);

    const qp = new HttpParams().append('symbol', symbol);
    const urlWithQueryParams = `http://localhost:8080/api/real-time-price?${qp.toString()}`;
    this.eventSource = new EventSource(urlWithQueryParams);

    return new Observable<string>((observer) => {
      this.eventSource!.onmessage = (event) => {
        console.log('event data from sse service: ', event.data);
        observer.next(event.data);
      };

      this.eventSource!.onerror = (error) => {
        observer.error('error occured: ' + error);
      };
    });
  }

  public closeConnection() {
    if (this.eventSource) {
      console.log('closing sse connection...');
      this.eventSource.close();
    }
  }
}
