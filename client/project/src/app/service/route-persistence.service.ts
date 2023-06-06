import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoutePersistenceService {
  constructor() {}

  saveCurrentRoute(route: string) {
    sessionStorage.setItem('currRoute', route);
  }

  getCurrentRoute(): string | null {
    return sessionStorage.getItem('currRoute');
  }

  clearCurrentRoute() {
    sessionStorage.removeItem('currRoute');
  }
}
