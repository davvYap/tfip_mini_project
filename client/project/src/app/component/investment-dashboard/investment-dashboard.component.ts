import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  PurchasedStock,
  PurchasedStocksCount,
  Stock,
  StockPrice,
} from 'src/app/models';
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

  lineData!: any;
  lineOptions!: any;
  sp500data!: number[];
  stockPerformanceData!: number[];
  startDate!: string;
  currDate!: string;
  months: string[] = [];
  endOfMonth!: string[];

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
              // console.log('market price >>> ', stock.marketPrice);
              // console.log('performance >>> ', stock.performance);
              this.stocksCount = [...this.stocksCount];
              this.stocksCount.push(stock);
              this.stocksCount = this.sortStockByMarketPrice(this.stocksCount);
            });
        }
      });

    this.months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'June',
      'July',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    this.startDate = this.getStartDateOfYear();
    this.currDate = this.getCurrentDate();
    this.endOfMonth = this.getEndOfMonth();
    this.stockPerformanceData = [28, 48, 40, 19, 86, 27, 30];

    // console.log(this.startDate);
    // console.log(this.currDate);
    // console.log(this.endOfMonth);
    this.getSvc
      .getStockMonthlyPrice('AAPL', this.startDate, this.currDate)
      .then((stockPrice: StockPrice[]) => {
        for (let i = 0; i < stockPrice.length; i++) {
          const stock = stockPrice[i];
          const date = stock.date.substring(0, 10);
          stock.date = date;
        }
        const performance: number[] = this.getMonthlyPerformance(
          stockPrice,
          this.endOfMonth
        );
        console.log(performance.reverse());
        this.sp500data = performance;
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

  getMonthlyPerformance(
    stockPrices: StockPrice[],
    endOfMonth: string[]
  ): number[] {
    let sp: number[] = [];
    for (let i = 0; i < stockPrices.length; i++) {
      const stockPrice = stockPrices[i];
      for (let j = 0; j < endOfMonth.length; j++) {
        if (stockPrice.date === endOfMonth[j]) {
          sp.push(stockPrice.close);
        }
      }
    }
    return sp;
  }

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
