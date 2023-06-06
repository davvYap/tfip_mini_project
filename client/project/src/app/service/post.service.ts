import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginStatus } from '../models';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}

  updateUserTheme(userId: string, theme: string): Promise<any> {
    let data = new HttpParams()
      .set('userId', userId)
      .append('userTheme', theme);

    const httpheader = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return lastValueFrom(
      this.http.post<any>('http://localhost:8080/api/theme', data.toString(), {
        headers: httpheader,
      })
    );
  }
}
