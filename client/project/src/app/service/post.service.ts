import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginStatus } from '../models';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}
}
