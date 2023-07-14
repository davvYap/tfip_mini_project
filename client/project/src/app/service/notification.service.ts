import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationMessage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  newNotification$ = new Subject<NotificationMessage[]>();

  constructor() {}
}
