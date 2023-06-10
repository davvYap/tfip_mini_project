import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Observable,
  Subscription,
  combineLatest,
  finalize,
  map,
  tap,
} from 'rxjs';
import { PurchasedStock, PurchasedStocksCount, Stock } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';

@Component({
  selector: 'app-investment-dashboard',
  templateUrl: './investment-dashboard.component.html',
  styleUrls: ['./investment-dashboard.component.css'],
})
export class InvestmentDashboardComponent implements OnInit, OnDestroy {
  stocks!: PurchasedStock[];
  stocksCount!: PurchasedStocksCount[];
  stocks$!: Subscription;
  stockPrice$!: Subscription;
  lazyLoading: boolean = true;
  loadLazyTimeout: any;

  constructor(private getSvc: GetService) {}

  ngOnInit() {
    this.stocks$ = this.getSvc
      .getUserStocksCount(this.getSvc.userId)
      .subscribe((data) => {
        // this.stocksCount = data;
        this.stocksCount = [];

        for (let i = 0; i < data.length; i++) {
          const stock = data[i];
          this.stockPrice$ = this.getSvc
            .getStonkStockPrice(stock.symbol)
            .subscribe((res) => {
              stock.marketPrice = res.price * stock.quantity;
              stock.performance = (stock.marketPrice - stock.cost) / stock.cost;
              console.log('market price >>> ', stock.marketPrice);
              console.log('performance >>> ', stock.performance);
              this.stocksCount = [...this.stocksCount];
              this.stocksCount.push(stock);
              this.stocksCount = this.sortStockByMarketPrice(this.stocksCount);
            });
        }
      });
  }

  ngOnDestroy(): void {
    if (this.stocks$) this.stocks$.unsubscribe();
    if (this.stockPrice$) this.stockPrice$.unsubscribe();
  }

  sortStockByDate(PurchasedStocks: PurchasedStock[]): PurchasedStock[] {
    const sorted = PurchasedStocks.sort((a, b) => {
      return b.date - a.date;
    });
    return sorted;
  }

  sortStockByMarketPrice(
    PurchasedStocks: PurchasedStocksCount[]
  ): PurchasedStocksCount[] {
    const sorted = PurchasedStocks.sort((a, b) => {
      return b.marketPrice - a.marketPrice;
    });
    return sorted;
  }
  getPerformanceClass(performance: number): string {
    return performance > 0 ? 'positive' : 'negative';
  }

  // getStockPrice(symbol: string): number {
  //   let price: number = 0;
  //   this.getSvc.getStonkStockPrice(symbol).then((res) => {
  //     price = res.price;
  //     console.log('price >>> ', price);
  //   });
  //   return price;
  // }

  // LAZY LOADING
  // onLazyLoad(event: any) {
  //   this.lazyLoading = true;

  //   if (this.loadLazyTimeout) {
  //     clearTimeout(this.loadLazyTimeout);
  //   }

  //   //imitate delay of a backend call
  //   this.loadLazyTimeout = setTimeout(() => {
  //     const { first, last } = event;
  //     const lazyItems = [...this.stocks];
  //     for (let i = first; i < last; i++) {
  //       lazyItems[i] = this.stocks[i];
  //     }
  //     this.stocks = lazyItems;
  //     this.lazyLoading = false;
  //   }, Math.random() * 1000 + 250);
  // }
}
