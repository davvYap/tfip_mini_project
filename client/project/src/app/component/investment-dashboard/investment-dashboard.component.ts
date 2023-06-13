import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Observable,
  Subject,
  Subscription,
  filter,
  map,
  switchMap,
} from 'rxjs';
import {
  PurchasedStock,
  PurchasedStocksCount,
  Stock,
  StockPrice,
} from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';

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
  lazyLoading: boolean = true;
  loadLazyTimeout: any;

  lineData!: any;
  lineOptions!: any;
  sp500data!: number[];
  nasdaq100data!: number[];
  stockPerformanceData!: number[];
  startDate!: string;
  currDate!: string;
  months: string[] = [];
  endOfMonth!: string[];
  eventCaller = new Subject<PurchasedStocksCount[]>();

  constructor(private getSvc: GetService, private themeSvc: ThemeService) {}

  ngOnInit() {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');

    // GET USER STOCK PORTFOLIO
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
              // console.log('market price >>> ', stock.marketPrice);
              // console.log('performance >>> ', stock.performance);
              this.stocksCount = [...this.stocksCount];
              this.stocksCount.push(stock);
              this.stocksCount = this.sortStockByMarketPrice(this.stocksCount);
              this.eventCaller.next(this.stocksCount);
            });
        }
      });

    // GET LINE CHART
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
    this.currDate = this.getCurrentDate();
    this.endOfMonth = this.getEndOfMonth();
    this.stockPerformanceData = [1.2, 2.3, 3.3, 4.5, 3.7, 4.3, 5.1];

    // console.log(this.startDate);
    // console.log(this.currDate);
    // console.log(this.endOfMonth);

    // GET VOO MONTHLY PERFORMANCE
    this.getSvc
      .getStockMonthlyPricePromise('VOO', this.startDate, this.currDate)
      .then((stockPrice: StockPrice[]) => {
        for (let i = 0; i < stockPrice.length; i++) {
          const stock = stockPrice[i];
          const date = stock.date.substring(0, 10);
          stock.date = date;
        }
        const performance: number[] = this.getStockMonthlyPerformance(
          stockPrice,
          this.endOfMonth
        );
        console.log(performance.reverse());
        this.sp500data = performance;
        this.initiateLineChart();
      });

    // GET QQQ MONTHLY PERFORMANCE
    this.getSvc
      .getStockMonthlyPricePromise('QQQ', this.startDate, this.currDate)
      .then((stockPrice: StockPrice[]) => {
        for (let i = 0; i < stockPrice.length; i++) {
          const stock = stockPrice[i];
          const date = stock.date.substring(0, 10);
          stock.date = date;
        }
        const performance: number[] = this.getStockMonthlyPerformance(
          stockPrice,
          this.endOfMonth
        );
        console.log(performance.reverse());
        this.nasdaq100data = performance;
        this.initiateLineChart();
      });

    // GET USER STOCK PERFORMANCE
    for (let i = 0; i < this.months.length; i++) {
      const month: string = this.months[i];
      let capital: number = 0;
      let totalStockMarketPrice: number = 0;
      this.getSvc
        .getUserStockByMonth(this.getSvc.userId, month)
        .subscribe((res: PurchasedStock[]) => {
          console.log(res);
          for (let i = 0; i < res.length; i++) {
            const stock: PurchasedStock = res[i];
            capital += stock.price * stock.quantity;
            const stockMarketPrices: number[] = this.getStockMonthlyMarketPrice(
              stock.symbol
            );

            const stockPerformance = this.calculateUserStockPerformance(
              stock.price,
              stock.quantity,
              stockMarketPrices
            );

            // console.log(stockMarketPrices);
          }
          console.log(capital);
        });
    }
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
          fill: true,
          borderColor: documentStyle.getPropertyValue('--yellow-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.sp500data,
        },
        {
          label: 'NASDAQ 100',
          fill: true,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.nasdaq100data,
        },
        {
          label: 'Portfolio',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          // yAxisID: 'y1',
          tension: 0.4,
          data: this.stockPerformanceData,
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
    const formattedDate = `${currDate.getFullYear()}-${(currDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currDate.getDate().toString().padStart(2, '0')}`;
    return formattedDate;
  }

  getCurrentMonth(): number {
    const currDate = new Date();
    return currDate.getMonth();
  }

  getEndOfMonth(): string[] {
    const months = this.months;
    let endOfMonth: string[] = [];
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const endDate = this.getSvc.getEndOfMonth(months, month);
      endOfMonth.push(endDate);
    }
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
    return sp;
  }

  getStockMonthlyMarketPrice(symbol: string): number[] {
    let sp: number[] = [];
    this.getSvc
      .getStockMonthlyPricePromise(symbol, this.startDate, this.currDate)
      .then((stockPrices: StockPrice[]) => {
        for (let i = 0; i < stockPrices.length; i++) {
          const stockPrice = stockPrices[i];
          for (let j = 0; j < this.endOfMonth.length; j++) {
            if (stockPrice.date === this.endOfMonth[j]) {
              sp.push(stockPrice.close);
            }
          }
        }
        sp.reverse();
      });
    return sp;
  }

  calculateUserStockPerformance(
    strikePrice: number,
    quantity: number,
    monthlyMarketPrice: number[]
  ): number[] {
    console.log('monthlyMarketPrice', monthlyMarketPrice); // HERE have results
    let performance: number[] = [];
    let capital = strikePrice * quantity;

    console.log('length of array', monthlyMarketPrice.length); // HERE array length is 0
    for (let i = 0; i < monthlyMarketPrice.length; i++) {
      console.log('monthlyMarketPrice[i]', monthlyMarketPrice[i]);
      performance.push(
        ((quantity * monthlyMarketPrice[i] - capital) / capital) * 100
      );
    }
    console.log('peformance', performance);
    return performance;
  }
}
