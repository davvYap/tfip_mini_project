import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { PurchasedStock } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';

@Component({
  selector: 'app-investment-dashboard',
  templateUrl: './investment-dashboard.component.html',
  styleUrls: ['./investment-dashboard.component.css'],
})
export class InvestmentDashboardComponent implements OnInit, OnDestroy {
  stocks!: PurchasedStock[];
  stocks$!: Subscription;
  lazyLoading: boolean = true;
  loadLazyTimeout: any;

  constructor(private getSvc: GetService) {}

  ngOnInit() {
    this.stocks$ = this.getSvc
      .getUserStocksMongo(this.getSvc.userId)
      .subscribe((data) => {
        const sortedData = this.sortStockByDate(data);
        this.stocks = sortedData;
      });
  }

  ngOnDestroy(): void {
    if (this.stocks$) this.stocks$.unsubscribe();
  }

  sortStockByDate(PurchasedStocks: PurchasedStock[]): PurchasedStock[] {
    const sorted = PurchasedStocks.sort((a, b) => {
      return b.date - a.date;
    });
    return sorted;
  }

  onLazyLoad(event: any) {
    this.lazyLoading = true;

    if (this.loadLazyTimeout) {
      clearTimeout(this.loadLazyTimeout);
    }

    //imitate delay of a backend call
    this.loadLazyTimeout = setTimeout(() => {
      const { first, last } = event;
      const lazyItems = [...this.stocks];
      for (let i = first; i < last; i++) {
        lazyItems[i] = this.stocks[i];
      }
      this.stocks = lazyItems;
      this.lazyLoading = false;
    }, Math.random() * 1000 + 250);
  }
}
