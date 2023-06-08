import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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
        this.stocksCount = data;
        for (let i = 0; i < this.stocksCount.length; i++) {
          const stock = this.stocksCount[i];
          this.stockPrice$ = this.getSvc
            .getStonkStockPrice(stock.symbol)
            .subscribe((res) => {
              stock.marketPrice = res.price * stock.quantity;
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
