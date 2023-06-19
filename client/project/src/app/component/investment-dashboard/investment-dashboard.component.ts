import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import {
  Observable,
  Subject,
  Subscription,
  filter,
  map,
  switchMap,
  mergeMap,
  tap,
  of,
  forkJoin,
  concatMap,
} from 'rxjs';
import {
  PurchasedStock,
  PurchasedStocksCount,
  SoldStock,
  Stock,
  StockLogo,
  StockPrice,
  StocksMonthlyPrice,
  StocksMonthlyQuantity,
  StonkStockPrice,
  UserMonthlyCapital,
} from 'src/app/models';
import { DeleteService } from 'src/app/service/delete.service';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';
import { InvestmentComponent } from '../investment/investment.component';
import { SellStockComponent } from '../sell-stock/sell-stock.component';
import { UpdateService } from 'src/app/service/update.service';

@Component({
  selector: 'app-investment-dashboard',
  templateUrl: './investment-dashboard.component.html',
  styleUrls: ['./investment-dashboard.component.css'],
})
export class InvestmentDashboardComponent implements OnInit, OnDestroy {
  stocks!: PurchasedStock[];
  stocksCount!: PurchasedStocksCount[]; // HERE CAN GET ALL USER STOCK SYMBOL
  stocks$!: Subscription;
  stockPrice$!: Subscription;

  lineData!: any;
  lineOptions!: any;
  sp500data!: number[];
  nasdaq100data!: number[];
  userStockData!: number[];
  startDate!: string;
  months: string[] = [];
  endOfMonth!: string[];
  eventCaller = new Subject<PurchasedStocksCount[]>();

  stocksMonthlyPrice: StocksMonthlyPrice[] = [];
  stockMonthlyQuantiy: StocksMonthlyQuantity[] = [];
  userMonthlyCapital: UserMonthlyCapital[] = [];
  userMonthlyPerformance: number[] = [];

  first = 0;
  loading: boolean = true;

  soldStocks$!: Subscription;
  soldStocks!: SoldStock[];

  unrealizedProfit: number = 0.0;

  dialogRef!: DynamicDialogRef;

  constructor(
    private getSvc: GetService,
    private themeSvc: ThemeService,
    private deleteSvc: DeleteService,
    private confirmationSvc: ConfirmationService,
    private messageSvc: MessageService,
    private dialogSvc: DialogService,
    private updateSvc: UpdateService
  ) {}

  ngOnInit() {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.themeSvc.initiateChartSetting();

    // HERE FOR STOCK COUNT
    this.stocksCount = [];
    this.initiateStockCount();

    // HERE FOR TABLE
    this.initiateStockTable();

    // HERE FOR SOLD STOCKS
    this.initiateSoldStockTable();

    // HERE FOR LINECHART
    // GET USER STOCK PORTFOLIO
    this.months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    this.startDate = this.getStartDateOfYear();
    this.endOfMonth = this.getEndOfMonth();
    this.userStockData = [];

    // console.log(this.startDate);
    // console.log(this.currDate);
    // console.log(this.endOfMonth);

    //NOTE GET VOO MONTHLY PERFORMANCE
    this.getSvc
      .getStockMonthlyPricePromise('VOO', this.startDate, this.getCurrentDate())
      .then((stockPrice: StockPrice[]) => {
        for (let i = 0; i < stockPrice.length; i++) {
          const stock = stockPrice[i];
          const date = stock.date.substring(0, 10);
          stock.date = date;
        }
        let endOfMonth: string[] = [...this.endOfMonth];
        endOfMonth.push(this.getCurrentDate());
        const performance: number[] = this.getStockMonthlyPerformance(
          stockPrice,
          endOfMonth
        );
        // console.log('sp500', performance);
        this.sp500data = performance;
        // this.initiateLineChart();
      });

    //NOTE GET QQQ MONTHLY PERFORMANCE
    this.getSvc
      .getStockMonthlyPricePromise('QQQ', this.startDate, this.getCurrentDate())
      .then((stockPrice: StockPrice[]) => {
        for (let i = 0; i < stockPrice.length; i++) {
          const stock = stockPrice[i];
          const date = stock.date.substring(0, 10);
          stock.date = date;
        }
        let endOfMonth: string[] = [...this.endOfMonth];
        endOfMonth.push(this.getCurrentDate());
        const performance: number[] = this.getStockMonthlyPerformance(
          stockPrice,
          endOfMonth
        );
        // console.log('nasdaq100', performance);
        this.nasdaq100data = performance;
        // this.initiateLineChart();
      });

    //NOTE GET USER STOCK PERFORMANCE
    this.getSvc
      .getUserMonthlyPerformance(this.getSvc.userId, new Date().getFullYear())
      .pipe(
        map((performance) => {
          this.userStockData = performance;
        })
      )
      .subscribe(() => {
        this.initiateLineChart();
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

  initiateStockCount() {
    this.stocks$ = this.getSvc
      .getUserStocksCount(this.getSvc.userId)
      .pipe(
        // get market price and performance
        switchMap((stockCounts: PurchasedStocksCount[]) => {
          let observables: Observable<StonkStockPrice>[] = [];
          stockCounts.map((stockCount) => {
            const observable = this.getSvc.getStonkStockPrice(
              stockCount.symbol
            );
            observables.push(observable);
          });
          return forkJoin(observables).pipe(
            map((results: StonkStockPrice[]) => {
              for (let i = 0; i < results.length; i++) {
                const stock = stockCounts[i];
                stock.marketPrice = results[i].price * stock.quantity;
                stock.performance =
                  (stock.marketPrice - stock.cost) / stock.cost;
              }
              return stockCounts;
            })
          );
        }),
        // get logo
        switchMap((stockCounts: PurchasedStocksCount[]) => {
          let observables: Observable<StockLogo>[] = [];
          stockCounts.map((stockCount) => {
            const observable = this.getSvc.getStockLogo(stockCount.symbol);
            observables.push(observable);
          });
          return forkJoin(observables).pipe(
            map((results: StockLogo[]) => {
              for (let i = 0; i < results.length; i++) {
                stockCounts[i].logo = results[i].url;
              }
              return stockCounts;
            })
          );
        })
      )
      .subscribe((stockCounts) => {
        this.stocksCount = this.sortStockByMarketPrice(stockCounts);
        this.calculateUnrealizedProfit(stockCounts);
      });
  }

  initiateLineChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.lineData = {
      labels: this.months,
      datasets: [
        {
          label: 'S&P 500',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--yellow-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.sp500data,
        },
        {
          label: 'NASDAQ 100',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.nasdaq100data,
        },
        {
          label: 'Portfolio',
          fill: true,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          // yAxisID: 'y1',
          tension: 0.4,
          data: this.userStockData,
        },
      ],
    };

    this.lineOptions = {
      stacked: false,
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            // color: textColor,
            color: '#fff',
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        // y1: {
        //   type: 'linear',
        //   display: true,
        //   position: 'right',
        //   ticks: {
        //     color: textColorSecondary,
        //   },
        //   grid: {
        //     drawOnChartArea: false,
        //     color: surfaceBorder,
        //   },
        // },
      },
    };
  }

  calculateUnrealizedProfit(stockCounts: PurchasedStocksCount[]) {
    this.stocksCount.map(
      (stockCount) =>
        (this.unrealizedProfit += stockCount.marketPrice - stockCount.cost)
    );
  }

  getStartDateOfYear(): string {
    const cuurDate = new Date();
    const currentYear = cuurDate.getFullYear();

    const startOfYear = new Date(currentYear, 0, 1);
    const formattedDate = `${startOfYear.getFullYear()}-${(
      startOfYear.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${startOfYear.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  getCurrentDate(): string {
    const currDate = new Date();
    const yesterdayDate = new Date(currDate);
    yesterdayDate.setDate(currDate.getDate() - 1);

    while (yesterdayDate.getDay() === 0 || yesterdayDate.getDay() === 6) {
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    }
    const formattedDate = `${yesterdayDate.getFullYear()}-${(
      yesterdayDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${yesterdayDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
    return formattedDate;
  }

  getEndOfMonth(): string[] {
    const months = this.months;
    let endOfMonth: string[] = [];
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const endDate = this.getSvc.getEndOfMonth(months, month);
      endOfMonth.push(endDate);
    }

    const today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    const formattedDate = `${yesterday.getFullYear()}-${(
      yesterday.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;
    endOfMonth.push(formattedDate);

    // include yesterday date
    return endOfMonth;
  }

  getStockMonthlyPerformance(
    stockPrices: StockPrice[],
    endOfMonth: string[]
  ): number[] {
    let sp: number[] = [];
    const firstPurchasePrice: number =
      stockPrices[stockPrices.length - 1].close;
    for (let i = 0; i < stockPrices.length; i++) {
      const stockPrice = stockPrices[i];
      for (let j = 0; j < endOfMonth.length; j++) {
        if (stockPrice.date === endOfMonth[j]) {
          sp.push(
            ((stockPrice.close - firstPurchasePrice) / firstPurchasePrice) * 100
          );
        }
      }
    }
    return sp.reverse();
  }

  initiateStockTable() {
    this.getSvc
      .getUserStocksMongo(this.getSvc.userId)
      .pipe(
        // get market price
        switchMap((stocks: PurchasedStock[]) => {
          let observables: Observable<StonkStockPrice>[] = [];
          stocks.map((stock) => {
            const observable = this.getSvc.getStonkStockPrice(stock.symbol);
            observables.push(observable);
          });
          return forkJoin(observables).pipe(
            map((results: StonkStockPrice[]) => {
              for (let i = 0; i < results.length; i++) {
                stocks[i].marketPrice = results[i].price;
              }
              // console.log('stocks', stocks);
              return stocks;
            })
          );
        }),
        // get stock logo
        switchMap((stocks: PurchasedStock[]) => {
          let observables: Observable<StockLogo>[] = [];
          stocks.map((stock) => {
            const observable = this.getSvc.getStockLogo(stock.symbol);
            observables.push(observable);
          });
          return forkJoin(observables).pipe(
            map((results: StockLogo[]) => {
              for (let i = 0; i < results.length; i++) {
                stocks[i].logo = results[i].url;
              }
              return stocks;
            })
          );
        }),
        map((stocks: PurchasedStock[]) => {
          for (let i = 0; i < stocks.length; i++) {
            const stock = stocks[i];
            // console.log(`${stock.symbol} ${stock.price} ${stock.marketPrice}`);
            stock.percentage = (stock.marketPrice - stock.price) / stock.price;
          }
          return stocks;
        })
      )
      .subscribe((stocks) => {
        this.stocks = this.sortStockByDate(stocks);
        this.loading = false;
      });
  }

  clear(table: Table) {
    table.clear();
  }

  deleteStock(purchaseId: string) {
    this.deleteSvc.deleteStock(purchaseId, this.getSvc.userId);
  }

  confirmDelete(event: any, purchaseId: string, symbol: string) {
    this.confirmationSvc.confirm({
      target: event.target,
      message: `Are you sure you want to delete ${symbol} ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteStock(purchaseId);
        this.messageSvc.add({
          severity: 'success',
          summary: 'Confirmed',
          detail: `You have deleted ${symbol} with order ID ${purchaseId}`,
        });
        setTimeout(() => {
          this.ngOnInit();
        }, 1000);
      },
      reject: () => {
        this.messageSvc.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'You have cancel the delete',
        });
      },
    });
  }

  refreshTable() {
    this.loading = true;
    setTimeout(() => {
      this.initiateStockTable();
    }, 500);
  }

  sellStock(stock: PurchasedStock) {
    console.log('passed stock', stock);
    this.getSvc.passStock = stock;
    this.dialogRef = this.dialogSvc.open(SellStockComponent, {
      header: 'Sell Order Details',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });

    this.dialogRef.onClose.subscribe((message: string) => {
      this.messageSvc.add({
        severity: 'success',
        summary: 'Successful',
        detail: message,
      });
      this.refreshTable();
      this.refreshSoldStockTable();
      this.refreshStockCountTable();
    });
  }

  initiateSoldStockTable() {
    this.soldStocks$ = this.getSvc
      .getUserSoldStocks(this.getSvc.userId)
      .pipe(
        // get logo
        switchMap((stocks: SoldStock[]) => {
          const observables: Observable<StockLogo>[] = [];
          stocks.map((stock) => {
            const observable = this.getSvc.getStockLogo(stock.symbol);
            observables.push(observable);
          });
          return forkJoin(observables).pipe(
            map((logos: StockLogo[]) => {
              for (let i = 0; i < stocks.length; i++) {
                stocks[i].logo = logos[i].url;
              }
              return stocks;
            })
          );
        }),
        // get percentage
        switchMap((stocks: SoldStock[]) => {
          stocks.map((stock) => {
            const boughtPrice = stock.price - stock.netProfit / stock.quantity;
            stock.percentage = stock.netProfit / stock.quantity / boughtPrice;
          });
          return of(stocks);
        }),
        // sort stocks by date
        switchMap((stocks) => {
          const sorted = stocks.sort((a, b) => {
            return b.date - a.date;
          });
          return of(sorted);
        })
      )
      .subscribe((soldStocks: SoldStock[]) => {
        this.soldStocks = soldStocks;
        this.loading = false;
      });
  }

  refreshSoldStockTable() {
    this.loading = true;
    setTimeout(() => {
      this.initiateSoldStockTable();
    }, 500);
  }

  refreshStockCountTable() {
    setTimeout(() => {
      this.initiateStockCount();
    }, 500);
  }

  hideProfit(event: any) {
    console.log(event);
  }

  // UNUSED
  // this.getSvc
  //   .getUserStocksCount(this.getSvc.userId)
  //   .pipe(
  //     tap((sc) => {
  //       // GET USER EACH MONTH CAPTIAL SPENT ON STOCKS
  //       const observables$: Observable<PurchasedStock[]>[] = [];
  //       for (let i = 0; i < this.months.length; i++) {
  //         const month = this.months[i];
  //         const observable = this.getSvc.getUserStockByMonth(
  //           this.getSvc.userId,
  //           month
  //         );
  //         observables$.push(observable);
  //       }

  //       forkJoin(observables$).subscribe((results) => {
  //         for (let i = 0; i < results.length; i++) {
  //           let totalCost = 0;
  //           const month = this.months[i];
  //           const stocks: PurchasedStock[] = results[i];

  //           for (let j = 0; j < stocks.length; j++) {
  //             totalCost +=
  //               stocks[j].price * stocks[j].quantity + stocks[j].fees;
  //           }

  //           // console.log(`${month}`, totalCost);
  //           this.userMonthlyCapital.push({
  //             month: month,
  //             capital: totalCost,
  //           });
  //         }
  //         // console.log('userTotalCapitalPerMonth', this.userMonthlyCapital);
  //       });
  //     }),
  //     switchMap((sc) => {
  //       // GET EACH STOCK MONTHLY QUANTITY
  //       sc.forEach((stock) => {
  //         let stkQty: number[] = [];
  //         for (let i = 0; i < this.months.length; i++) {
  //           const month = this.months[i];
  //           this.getSvc
  //             .getStockQtyByMonth(this.getSvc.userId, month, stock.symbol)
  //             .subscribe((qty) => {
  //               stkQty.push(qty.quantity);
  //             });
  //         }
  //         this.stockMonthlyQuantiy.push({
  //           symbol: stock.symbol,
  //           quantity: stkQty,
  //         });
  //       });
  //       // console.log('stockMonthlyQuantity', this.stockMonthlyQuantiy);
  //       const smq = [...this.stockMonthlyQuantiy];
  //       //   console.log('smq1', smq);
  //       const observables = forkJoin({
  //         sc: of(sc),
  //         sq: of(smq),
  //       });
  //       return observables;
  //     }),
  //     switchMap((observables) => {
  //       // GET EACH STOCK MONTHLY PRICE
  //       const stockPricesObservables$: Observable<StocksMonthlyPrice>[] =
  //         observables.sc.map((stockCount) => {
  //           // map() => stream() in java
  //           const symbol: string = stockCount.symbol;
  //           return this.getSvc
  //             .getStockMonthlyPrice(symbol, this.startDate, this.currDate)
  //             .pipe(
  //               map((stockPrice: StockPrice[]) => {
  //                 for (let i = 0; i < stockPrice.length; i++) {
  //                   const stock = stockPrice[i];
  //                   const date = stock.date.substring(0, 10);
  //                   stock.date = date;
  //                 }
  //                 const marketPrice: number[] = this.getStockMonthlyPrice(
  //                   stockPrice,
  //                   this.endOfMonth
  //                 );
  //                 return {
  //                   symbol: symbol,
  //                   marketPrice: marketPrice,
  //                 };
  //               })
  //             );
  //         });

  //       // to check the results
  //       forkJoin(stockPricesObservables$).subscribe((results) => {
  //         this.stocksMonthlyPrice = results;
  //         // console.log('stockMonthlyPrice', this.stocksMonthlyPrice);
  //       });

  //       // combine all results to calculate user performance
  //       const finalObs = forkJoin(stockPricesObservables$)
  //         .pipe(
  //           concatMap((res) => {
  //             const mergeResult = {
  //               sp: res,
  //               sq: observables.sq,
  //             };
  //             return of(mergeResult);
  //           })
  //         )
  //         .subscribe((finalResults) => {
  //           this.userStockData = this.calculateUserPerformance(
  //             finalResults.sq,
  //             finalResults.sp,
  //             this.userMonthlyCapital,
  //             this.months
  //           );
  //           console.log('userStockData', this.userStockData);
  //           this.initiateLineChart();
  //         });
  //       return of(finalObs);
  //     })
  //   )
  //   .subscribe();

  // calculateUserPerformance(
  //   smq: StocksMonthlyQuantity[],
  //   smp: StocksMonthlyPrice[],
  //   uc: UserMonthlyCapital[],
  //   months: string[]
  // ): number[] {
  //   // console.log('function smq', smq);
  //   // console.log('function smp', smp);
  //   // console.log('function uc', uc);
  //   let totalCap = 0;
  //   uc.map((cap) => {
  //     totalCap += cap.capital;
  //   });
  //   // console.log('total capital', totalCap);
  //   let userPerformance: number[] = [];
  //   let previousMonthAccCapital = 0;
  //   for (let i = 0; i < months.length; i++) {
  //     //   console.log(`${this.months[i]}`);
  //     const month = months[i];

  //     let totalMonthlyMarketPrice = this.calculateAccumulateStockMarketPrice(
  //       month,
  //       months,
  //       smq,
  //       smp
  //     );

  //     if (uc[i].month === month && totalMonthlyMarketPrice != 0) {
  //       // console.log(`cap for ${month}`, uc[i].capital);
  //       const cap = uc[i].capital + previousMonthAccCapital;
  //       // console.log('cap', cap);
  //       const price = totalMonthlyMarketPrice;
  //       // console.log('price', price);
  //       const performance: number = ((price - cap) / cap) * 100;
  //       userPerformance.push(performance);
  //       // console.log('performance', performance);
  //       previousMonthAccCapital += uc[i].capital;
  //       // console.log('prev cap', previousMonthAccCapital);
  //     }
  //   }
  //   return userPerformance;
  // }

  // calculateAccumulateStockMarketPrice(
  //   month: string,
  //   months: string[],
  //   smq: StocksMonthlyQuantity[],
  //   smp: StocksMonthlyPrice[]
  // ): number {
  //   const index: number = months.indexOf(month);
  //   let totalMonthlyMarketPrice = 0;
  //   for (let i = 0; i < index + 1; i++) {
  //     //   console.log('i', i);
  //     // get user stocks month performance
  //     for (let j = 0; j < smq.length; j++) {
  //       for (let k = 0; k < smp.length; k++) {
  //         const sqRep = smq[j];
  //         const spRep = smp[k];
  //         if (sqRep.symbol === spRep.symbol) {
  //           // console.log(`sqRep: ${sqRep.symbol} --- spRep: ${spRep.symbol}`);
  //           if (!isNaN(sqRep.quantity[i]) && !isNaN(spRep.marketPrice[index])) {
  //             totalMonthlyMarketPrice +=
  //               sqRep.quantity[i] * spRep.marketPrice[index];
  //           }
  //           // console.log('total mp', totalMonthlyMarketPrice);
  //         }
  //       }
  //     }
  //   }
  //   return totalMonthlyMarketPrice;
  // }

  // getStockMonthlyPrice(
  //   stockPrices: StockPrice[],
  //   endOfMonth: string[]
  // ): number[] {
  //   let sp: number[] = [];
  //   for (let i = 0; i < stockPrices.length; i++) {
  //     const stockPrice = stockPrices[i];
  //     for (let j = 0; j < endOfMonth.length; j++) {
  //       if (stockPrice.date === endOfMonth[j]) {
  //         sp.push(stockPrice.close);
  //       }
  //     }
  //   }
  //   return sp.reverse();
  // }
}
