import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  currentBreakpoint!: string;

  constructor(private breakpointObserver: BreakpointObserver) {}

  initBreakpointObserver() {
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .subscribe((result) => {
        if (result.matches) {
          if (result.breakpoints[Breakpoints.XSmall]) {
            this.currentBreakpoint = '95%';
          }
          if (result.breakpoints[Breakpoints.Small]) {
            this.currentBreakpoint = '95%';
          }
          if (result.breakpoints[Breakpoints.Medium]) {
            this.currentBreakpoint = '60%';
          }
          if (result.breakpoints[Breakpoints.Large]) {
            this.currentBreakpoint = '50%';
          }
          if (result.breakpoints[Breakpoints.XLarge]) {
            this.currentBreakpoint = '50%';
          }
        }
      });
  }
}
