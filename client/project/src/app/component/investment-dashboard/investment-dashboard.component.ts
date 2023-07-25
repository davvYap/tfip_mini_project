import {
  Component,
  OnInit,
  OnDestroy,
  WritableSignal,
  signal,
  computed,
  Signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Title } from '@angular/platform-browser';
import {
  Observable,
  Subject,
  Subscription,
  map,
  switchMap,
  of,
  forkJoin,
  tap,
} from 'rxjs';
import {
  Column,
  ExportColumn,
  NotificationMessage,
  PurchasedStock,
  PurchasedStocksCount,
  SoldStock,
  Stock,
  StockDayPerformance,
  StockLogo,
  StockMonthlyPrice,
  StockPrice,
  StockScreen,
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
import { ExportService } from 'src/app/service/export.service';
import { TreeNode } from 'primeng/api';
import {
  faFolderOpen,
  faHandPointRight,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from 'src/app/service/notification.service';
import { Params, Router } from '@angular/router';
import { BreakpointService } from 'src/app/service/breakpoint.service';
import { PostService } from 'src/app/service/post.service';

@Component({
  selector: 'app-investment-dashboard',
  templateUrl: './investment-dashboard.component.html',
  styleUrls: ['./investment-dashboard.component.css'],
})
export class InvestmentDashboardComponent implements OnInit, OnDestroy {
  pointRightIcon = faHandPointRight;
  emptyIcon = faFolderOpen;
  today = new Date();
  documentStyle = signal(getComputedStyle(document.documentElement));
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;
  portfolioExportBtnItems!: MenuItem[];

  donutData!: any;
  donutOptions!: any;
  chartPlugin: {
    id: string;
    beforeDraw: (chart: any, args: any, options: any) => void;
  }[] = [
    {
      id: 'customCanvasBackgroundColor',
      beforeDraw: (chart: any, args: any, options: any) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle =
          options.color ||
          this.documentStyle().getPropertyValue('--surface-ground');
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    },
  ];
  stockCountDonutSymbol!: string[];
  stockCountDonutData: WritableSignal<number[]> = signal([]);
  categoriesColor!: string[];
  stocks!: PurchasedStock[];
  stocksCount!: PurchasedStocksCount[]; // HERE CAN GET ALL USER STOCK SYMBOL
  stocks$!: Subscription;
  stocksCount$!: Subscription;
  stockPrice$!: Subscription;
  completeStocksSignal: WritableSignal<boolean> = signal(false);
  completeStocksCountSignal: WritableSignal<boolean> = signal(false);
  showEmptyStocks: boolean = false;

  skeletonLoading: boolean = true;
  lineData!: any;
  lineOptions!: any;
  lineChartData$!: Subscription;
  sp500data!: number[];
  nasdaq100data!: number[];
  userStockData!: number[];
  userStockDataLineData: WritableSignal<number[]> = signal([]);
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

  totalStockMarketValue: number = 0.0;
  unrealizedProfit: number = 0.0;
  realizedProfit: number = 0.0;

  dialogRef!: DynamicDialogRef;

  portfolioTableCols!: Column[];
  portfolioTableExportColumns!: ExportColumn[];
  transactionsTableCols!: Column[];
  transactionsTableExportColumns!: ExportColumn[];
  soldTableCols!: Column[];
  soldTableExportColumns!: ExportColumn[];

  treeTableLoading: boolean = true;
  stockTreeTable!: TreeNode[];
  frozenCols!: Column[];
  initTreeTableSignal: Signal<boolean> = computed(() => {
    return this.completeStocksSignal() && this.completeStocksCountSignal();
  });
  initTreeTableSignal$: Observable<boolean> = toObservable(
    this.initTreeTableSignal
  );

  filteredStocksSymbol!: String[];
  stocksData$!: Subscription;
  filterStocks!: Stock[];

  userRecentStockScreenSearch$!: Observable<StockScreen[]>;

  constructor(
    private getSvc: GetService,
    private themeSvc: ThemeService,
    private deleteSvc: DeleteService,
    private confirmationSvc: ConfirmationService,
    private messageSvc: MessageService,
    private dialogSvc: DialogService,
    private postSvc: PostService,
    private exportSvc: ExportService,
    private title: Title,
    private notificationSvc: NotificationService,
    private router: Router,
    private breakpointSvc: BreakpointService
  ) {}

  ngOnInit() {
    this.breadcrumbItems = [
      { label: 'Portfolio', routerLink: '/investment-dashboard' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.themeSvc.initiateChartSetting();
    this.title.setTitle(`${this.getSvc.applicationName} | Investment`);

    // NOTE EXPORT FUNCTION FOR ALL TABLES
    this.initiateTableCols();

    this.themeSvc.switchTheme$.subscribe((res) => {
      console.log(res);
      if (res) {
        this.initiateLineChartData();
        this.initiateStockCount();
      }
    });

    // HERE FOR STOCK COUNT
    this.stockCountDonutSymbol = [];
    this.categoriesColor = [];
    // this.stocksCount = [];
    this.initiateStockCount();

    // HERE FOR PORTFOLIO TABLE
    this.initiateStockTable();

    // HERE FOR TREE TABLE
    this.stockTreeTable = [];
    this.initTreeTableSignal$.subscribe((res: boolean) => {
      if (res) {
        // console.log('initiate tree table');
        this.initiateTreeTable();
      } else {
        this.treeTableLoading = true;
      }
    });
    this.frozenCols = [{ field: 'symbol', header: 'Symbol' }];

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
    this.startDate = this.getSvc.getStartDateOfYear();
    this.endOfMonth = this.getEndOfMonth();
    // console.log(this.endOfMonth);
    this.userStockData = [];

    // console.log(this.startDate);
    // console.log(this.currDate);
    // console.log(this.endOfMonth);

    //NOTE Initiate Line Chart
    this.initiateLineChartData();

    this.breakpointSvc.initBreakpointObserver();

    this.userRecentStockScreenSearch$ = this.getSvc.getUserRecentStockSearch(
      this.getSvc.userId
    );
  }

  ngOnDestroy(): void {
    if (this.stocks$) this.stocks$.unsubscribe();
    if (this.stocksCount$) this.stocksCount$.unsubscribe();
    if (this.stockPrice$) this.stockPrice$.unsubscribe();
    if (this.lineChartData$) this.lineChartData$.unsubscribe();
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
    this.stocksCount$ = this.getSvc
      .getUserStocksCount(this.getSvc.userId)
      .pipe(
        tap((stockCounts: PurchasedStocksCount[]) => {
          this.stocksCount = [];
          if (stockCounts.length === 0) {
            this.showEmptyStocks = true;
          }
        }),
        // get market price and performance
        switchMap((stockCounts: PurchasedStocksCount[]) => {
          let observables: Observable<Stock>[] = [];
          stockCounts.map((stockCount) => {
            const observable = this.getSvc.getStockPriceObservable(
              stockCount.symbol
            );
            observables.push(observable);
          });
          return forkJoin(observables).pipe(
            map((results: Stock[]) => {
              for (let i = 0; i < results.length; i++) {
                const stock = stockCounts[i];
                stock.marketPrice =
                  parseFloat(results[i].price) * stock.quantity;
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
        }),
        // get stock day performance
        switchMap((stockCounts: PurchasedStocksCount[]) => {
          let observables: Observable<StockDayPerformance>[] = [];
          stockCounts.map((stockCount) => {
            const observable = this.getSvc.getStockDayPerformance(
              stockCount.symbol
            );
            observables.push(observable);
          });
          return forkJoin(observables).pipe(
            map((results: StockDayPerformance[]) => {
              for (let i = 0; i < results.length; i++) {
                stockCounts[i].dayPerformance = results[i].dayPerformance;
              }
              return stockCounts;
            })
          );
        })
      )
      .subscribe((stockCounts) => {
        this.stocksCount = this.sortStockByMarketPrice(stockCounts);
        this.totalStockMarketValue =
          this.calculateUserTotalStockMarketValue(stockCounts);
        this.unrealizedProfit = this.calculateUnrealizedProfit(stockCounts);

        this.stockCountDonutSymbol = [];
        this.stockCountDonutData.set([]);
        // for stock donut chart
        this.stocksCount.map((sc) => {
          this.stockCountDonutSymbol.push(sc.symbol);
          this.stockCountDonutData.mutate((scData) => {
            scData.push(sc.marketPrice);
          });
          const latestIndex = this.stockCountDonutSymbol.length;
          this.categoriesColor.push(this.getSvc.getColors(latestIndex));
        });
        this.initiateDonutChart();
        this.completeStocksCountSignal.set(true);
      });
  }

  initiateTreeTable() {
    this.stocksCount.map((sc) => {
      let stockData: TreeNode<any> = {
        data: {
          symbol: sc.symbol,
          name: sc.name,
          quantity: sc.quantity,
          cost: sc.cost / sc.quantity,
          marketPrice: sc.marketPrice / sc.quantity,
          dayPerformance: sc.dayPerformance,
          performance: sc.performance,
          logo: sc.logo,
          fees: 0,
        },
        children: [],
      };
      let totalFees = 0;
      this.stocks.map((stk) => {
        if (sc.symbol === stk.symbol) {
          totalFees += stk.fees;
          stockData.children?.push({
            data: {
              symbol: stk.symbol,
              name: stk.name,
              quantity: stk.quantity,
              cost: stk.price * stk.quantity,
              marketPrice: stk.marketPrice * stk.quantity,
              performance: stk.percentage,
              date: stk.date,
              fees: stk.fees,
              purchaseId: stk.purchaseId,
            },
          });
        }
      });
      stockData.data.fees = totalFees;
      this.stockTreeTable.push(stockData);
    });
    this.stockTreeTable = this.stockTreeTable.sort((a, b) =>
      a.data.symbol.localeCompare(b.data.symbol)
    );
    this.treeTableLoading = false;
  }

  initiateDonutChart() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue('--text-color');

    this.donutData = {
      labels: this.stockCountDonutSymbol,
      datasets: [
        {
          data: this.stockCountDonutData(),
          backgroundColor: this.categoriesColor,
          hoverBackgroundColor: this.categoriesColor,
        },
      ],
      doughnutlabel: [],
    };

    this.donutOptions = {
      cutout: '60%',
      hoverOffset: 10,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            // color: '#fff',
            padding: 10,
          },
        },
        title: {
          display: true,
          text: 'Portfolio Stocks',
          position: 'bottom',
          padding: {
            top: 20,
            bottom: 0,
          },
          // color: '#fff',
          color: textColor,
        },
        customCanvasBackgroundColor: {
          color: this.documentStyle().getPropertyValue('--surface-ground'),
        },
      },
    };
  }

  initiateLineChartData() {
    this.lineChartData$ = this.getSvc
      .getUserMonthlyPerformance(this.getSvc.userId, new Date().getFullYear())
      .pipe(
        switchMap((performance) => {
          // console.log('user performance', performance);
          this.userStockData = performance;
          this.userStockDataLineData.set(performance);
          return of(performance);
        }),
        switchMap((performance) => {
          //NOTE GET VOO MONTHLY PERFORMANCE
          // let observables: Observable<StockPrice[]>[] = [];
          let observables: Observable<StockMonthlyPrice>[] = [];
          const observable = this.getSvc.getStockMonthlyPrice(
            'VOO',
            this.startDate,
            this.getSvc.getTodaysDate()
          );
          observables.push(observable);
          // console.log('voo date', this.getSvc.getTodaysDate());
          return forkJoin(observables).pipe(
            map((prices: StockMonthlyPrice[]) => {
              const stockPrices: StockMonthlyPrice = prices[0];
              const performance: number[] =
                this.getStockMonthlyPerformance(stockPrices);
              this.sp500data = performance;
              return performance;
            })
          );
        }),
        switchMap((performance) => {
          //NOTE GET QQQ MONTHLY PERFORMANCE
          // let observables: Observable<StockPrice[]>[] = [];
          let observables: Observable<StockMonthlyPrice>[] = [];
          const observable = this.getSvc.getStockMonthlyPrice(
            'QQQ',
            this.startDate,
            this.getSvc.getTodaysDate()
          );
          observables.push(observable);
          // console.log('qqq date', this.getSvc.getTodaysDate());
          return forkJoin(observables).pipe(
            map((prices: StockMonthlyPrice[]) => {
              const stockPrices: StockMonthlyPrice = prices[0];
              const performance: number[] =
                this.getStockMonthlyPerformance(stockPrices);
              this.nasdaq100data = performance;
              return performance;
            })
          );
        })
      )
      .subscribe(() => {
        // console.log(this.nasdaq100data, this.sp500data);
        this.skeletonLoading = false;
        // console.log('initiate line chart');
        this.initiateLineChart();
        this.getNotificationOfLineChart();
      });
  }

  initiateLineChart() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue('--text-color');
    const textColorSecondary = this.documentStyle().getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder =
      this.documentStyle().getPropertyValue('--surface-border');

    this.lineData = {
      labels: this.months,
      datasets: [
        {
          label: 'S&P 500',
          fill: false,
          borderColor: this.documentStyle().getPropertyValue('--yellow-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.sp500data,
        },
        {
          label: 'NASDAQ 100',
          fill: false,
          borderColor: this.documentStyle().getPropertyValue('--blue-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.nasdaq100data,
        },
        {
          label: 'Portfolio',
          fill: true,
          borderColor: this.documentStyle().getPropertyValue('--green-500'),
          // yAxisID: 'y1',
          tension: 0.4,
          // data: this.userStockData,
          data: this.userStockDataLineData(),
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
            color: textColor,
            // color: '#fff',
          },
        },
        customCanvasBackgroundColor: {
          color: this.documentStyle().getPropertyValue('--surface-ground'),
        },
        title: {
          display: true,
          text: `Performance Benchmark`,
          color: textColorSecondary,
          position: 'bottom',
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
      },
      hoverRadius: 15,
      interaction: {
        intersect: false,
        mode: 'index',
      },
    };
  }

  calculateUnrealizedProfit(stockCounts: PurchasedStocksCount[]): number {
    let total: number = 0.0;
    stockCounts.map((stockCount) => {
      total += stockCount.marketPrice - stockCount.cost;
    });
    return total;
  }

  calculateUserTotalStockMarketValue(
    stockCounts: PurchasedStocksCount[]
  ): number {
    let totalMarketValue = 0.0;
    stockCounts.map((stockCount) => {
      totalMarketValue += stockCount.marketPrice;
    });
    return totalMarketValue;
  }

  getCurrentDate(): string {
    return this.getSvc.getCurrentDate();
  }

  getEndOfMonth(): string[] {
    return this.getSvc.getEndOfMonthFinal();
  }

  getStockMonthlyPerformance(stockMontlyPrice: StockMonthlyPrice): number[] {
    let sp: number[] = [];
    // const firstPurchasePrice: number =
    //   stockPrices[stockPrices.length - 1].close;
    const firstPurchasePrice: number = stockMontlyPrice.firstClosePrice;
    const prices: number[] = stockMontlyPrice.monthlyPrices;
    for (let i = 0; i < prices.length; i++) {
      if (prices[i] > 0) {
        sp.push(((prices[i] - firstPurchasePrice) / firstPurchasePrice) * 100);
      }
    }
    // return sp.reverse();
    return sp;
  }

  initiateStockTable() {
    this.stocks$ = this.getSvc
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
        this.completeStocksSignal.set(true);
      });
  }

  clear(table: Table) {
    table.clear();
    const input1 = document.getElementById('input1') as HTMLInputElement;
    const input2 = document.getElementById('input2') as HTMLInputElement;
    const input1Mobile = document.getElementById(
      'input1Mobile'
    ) as HTMLInputElement;
    const input2Mobile = document.getElementById(
      'input2Mobile'
    ) as HTMLInputElement;
    input1.value = '';
    input2.value = '';
    input1Mobile.value = '';
    input2Mobile.value = '';
  }

  confirmDeleteTreeTable(event: any, symbol: string, purchaseId: string) {
    const userId = this.getSvc.userId;
    this.confirmationSvc.confirm({
      target: event.target,
      message: `Are you sure you want to delete ${symbol} ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // when no purchaseId -> stock count
        // console.log(purchaseId);
        if (!!!purchaseId) {
          this.deleteSvc
            .deleteStockWithSymbol(symbol, userId)
            .then((res) => {
              this.messageSvc.add({
                severity: 'success',
                summary: 'Confirmed',
                detail: `You have deleted ${symbol} stocks from your portfolio`,
              });
            })
            .catch((err) => {
              this.messageSvc.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error on deleting ${symbol} stocks`,
              });
            });
        } else {
          this.deleteSvc
            .deleteStockWithPurchaseId(purchaseId, userId)
            .then((res) => {
              this.messageSvc.add({
                severity: 'success',
                summary: 'Confirmed',
                detail: `You have deleted ${symbol} with order ID ${purchaseId}`,
              });
              // setTimeout(() => {
              //   this.ngOnInit();
              // }, 5000);
            })
            .catch((err) => {
              this.messageSvc.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error on deleting ${symbol} with order ID ${purchaseId}`,
              });
            });
        }
        setTimeout(() => {
          this.refreshLineCharts();
          this.refreshAllTables();
        }, 500);
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

  confirmDelete(event: any, purchaseId: string, symbol: string) {
    this.confirmationSvc.confirm({
      target: event.target,
      message: `Are you sure you want to delete ${symbol} ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteSvc
          .deleteStockWithPurchaseId(purchaseId, this.getSvc.userId)
          .then((res) => {
            this.messageSvc.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: `You have deleted ${symbol} with order ID ${purchaseId}`,
            });
            setTimeout(() => {
              this.refreshLineCharts();
              this.refreshAllTables();
            }, 2000);
          })
          .catch((err) => {
            this.messageSvc.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error on deleting ${symbol} with order ID ${purchaseId}`,
            });
          });
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

  sellStockCount(rowData: any) {
    const stock: PurchasedStock = {
      purchaseId: rowData.purchaseId ? rowData.purchaseId : '',
      symbol: rowData.symbol,
      name: rowData.name,
      quantity: rowData.quantity,
      fees: rowData.fees,
      date: new Date().getTime(),
      price: rowData.cost / rowData.quantity,
      marketPrice: rowData.marketPrice / rowData.quantity,
      percentage: rowData.performance,
      logo: rowData.logo,
    };
    console.log('passed stock', stock);
    this.getSvc.passStock = stock;
    this.dialogRef = this.dialogSvc.open(SellStockComponent, {
      header: 'Sell Order Details',
      width: this.breakpointSvc.currentBreakpoint,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });

    this.dialogRef.onClose.subscribe((message: string) => {
      if (message !== undefined) {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Successful',
          detail: message,
        });
        this.refreshAllTables();
        this.refreshLineCharts();
      }
    });
  }

  sellStock(stock: PurchasedStock) {
    console.log('passed stock', stock);
    this.getSvc.passStock = stock;
    this.dialogRef = this.dialogSvc.open(SellStockComponent, {
      header: 'Sell Order Details',
      width: this.breakpointSvc.currentBreakpoint,
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });

    this.dialogRef.onClose.subscribe((message: string) => {
      if (message !== undefined) {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Successful',
          detail: message,
        });
        this.refreshAllTables();
        this.refreshLineCharts();
      }
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
        this.realizedProfit = this.calculateRealizedProfit(soldStocks);
      });
  }

  calculateRealizedProfit(soldStocks: SoldStock[]): number {
    let total: number = 0;
    soldStocks.map((stock) => {
      total += stock.netProfit;
    });
    return total;
  }

  refreshSoldStockTable() {
    this.loading = true;
    setTimeout(() => {
      this.initiateSoldStockTable();
    }, 500);
  }

  refreshStockCountTable() {
    setTimeout(() => {
      // here will refresh donut chart as it was subscribe to it
      this.initiateStockCount();
    }, 500);
  }

  refreshTreeTable() {
    this.stockTreeTable = [];
    this.completeStocksSignal.set(false);
    this.completeStocksCountSignal.set(false);
    setTimeout(() => {
      this.completeStocksSignal.set(true);
      this.completeStocksCountSignal.set(true);
    }, 2000);
  }

  refreshTable() {
    this.loading = true;
    setTimeout(() => {
      this.initiateStockTable();
    }, 500);
  }

  refreshLineCharts() {
    setTimeout(() => {
      // here will refresh line chart as it was subscribe to it
      this.initiateLineChartData();
    }, 500);
  }
  refreshAllTables() {
    this.refreshSoldStockTable();
    this.refreshStockCountTable();
    this.refreshTable();
    this.refreshTreeTable();
  }

  getProfitColorClass(unrealizedProfit: number): string {
    return unrealizedProfit > 0 ? 'positive' : 'negative';
  }

  hideProfit() {
    const unrealizedMarketValue = document.getElementById(
      'unrealized-market-value'
    );
    const dummyUnrealizedValue = document.getElementById(
      'dummy-unrealized-value'
    );
    const unrealizedProfit = document.getElementById('unrealized-profit');
    const dummyUnrealizedProfit = document.getElementById(
      'dummy-unrealized-profit'
    );
    const realizedProfit = document.getElementById('realized-profit');
    const dummyRealizedProfit = document.getElementById(
      'dummy-realized-profit'
    );
    const showIcon = document.getElementById('show-icon');
    const hideIcon = document.getElementById('hide-icon');
    if (
      unrealizedMarketValue!.style.display !== 'none' ||
      unrealizedProfit!.style.display !== 'none'
    ) {
      unrealizedProfit!.style.display = 'none';
      unrealizedMarketValue!.style.display = 'none';
      dummyUnrealizedProfit!.style.display = 'inline';
      dummyUnrealizedValue!.style.display = 'inline';
      hideIcon!.style.display = 'none';
      showIcon!.style.display = 'inline';
    } else {
      unrealizedProfit!.style.display = 'inline';
      unrealizedMarketValue!.style.display = 'inline';
      dummyUnrealizedProfit!.style.display = 'none';
      dummyUnrealizedValue!.style.display = 'none';
      hideIcon!.style.display = 'inline';
      showIcon!.style.display = 'none';
    }

    if (realizedProfit!.style.display !== 'none') {
      realizedProfit!.style.display = 'none';
      dummyRealizedProfit!.style.display = 'inline';
      hideIcon!.style.display = 'none';
      showIcon!.style.display = 'inline';
    } else {
      realizedProfit!.style.display = 'inline';
      dummyRealizedProfit!.style.display = 'none';
      hideIcon!.style.display = 'inline';
      showIcon!.style.display = 'none';
    }
  }

  initiateTableCols() {
    this.portfolioTableCols = [
      {
        header: 'Symbol',
        field: 'symbol',
      },
      {
        header: 'Name',
        field: 'name',
      },
      {
        header: 'Quantity',
        field: 'quantity',
      },
      {
        header: 'Cost',
        field: 'cost',
      },
      {
        header: 'Market Price',
        field: 'marketPrice',
      },
      {
        header: 'Percentage',
        field: 'percentage',
      },
    ];
    this.portfolioTableExportColumns = this.portfolioTableCols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.transactionsTableCols = [
      {
        header: 'Symbol',
        field: 'symbol',
      },
      {
        header: 'Name',
        field: 'name',
      },
      {
        header: 'Date',
        field: 'date',
        customExportHeader: 'Transaction Date',
      },
      {
        header: 'Quantity',
        field: 'quantity',
      },
      {
        header: 'Bought Price',
        field: 'price',
      },
      {
        header: 'Market Price',
        field: 'marketPrice',
      },
      {
        header: '% Change',
        field: 'percentage',
      },
    ];
    this.transactionsTableExportColumns = this.transactionsTableCols.map(
      (col) => ({
        title: col.header,
        dataKey: col.field,
      })
    );

    this.soldTableCols = [
      {
        header: 'Symbol',
        field: 'symbol',
      },
      {
        header: 'Name',
        field: 'name',
      },
      {
        header: 'Date',
        field: 'date',
        customExportHeader: 'Transaction Date',
      },
      {
        header: 'Quantity',
        field: 'quantity',
      },
      {
        header: 'Sold Price',
        field: 'price',
      },
      {
        header: 'Realized Profit',
        field: 'netProfit',
      },
      {
        header: '% ROI',
        field: 'percentage',
      },
    ];
    this.soldTableExportColumns = this.soldTableCols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.portfolioExportBtnItems = [
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.exportExcelPortfolio(),
      },
    ];
  }

  exportExcelPortfolio(): void {
    this.exportSvc.exportExcel(
      'stocktt',
      `portfolio_${this.getSvc.userId}_${this.today.getFullYear()}`
    );
  }

  exportExcelTransaction(): void {
    this.exportSvc.exportExcel(
      'dt1',
      `transactions_${this.getSvc.userId}_${this.today.getFullYear()}`
    );
  }

  exportExcelSoldStocks(): void {
    this.exportSvc.exportExcel(
      'dt2',
      `sold-stock-transactions_${
        this.getSvc.userId
      }_${this.today.getFullYear()}`
    );
  }

  exportPdfPortfolio(): void {
    this.exportSvc.exportPdf(
      this.portfolioTableExportColumns,
      this.stocksCount,
      `portfolio_${this.getSvc.userId}_${this.today.getFullYear()}`
    );
  }

  exportPdfTransaction(): void {
    this.exportSvc.exportPdf(
      this.transactionsTableExportColumns,
      this.stocks,
      `transactions_${this.getSvc.userId}_${this.today.getFullYear()}`
    );
  }

  exportPdfSoldStocks(): void {
    // method 1
    // const doc = new jsPDF('landscape', 'px', 'a4');
    // (doc as any).autoTable(this.exportColumns, this.soldStocks);

    // method 2
    this.exportSvc.exportPdf(
      this.soldTableExportColumns,
      this.soldStocks,
      `sold-stock-transactions_${
        this.getSvc.userId
      }_${this.today.getFullYear()}`
    );
  }

  getProfitIcon(profit: number): string {
    return profit > 0 ? 'pi pi-fw pi-arrow-up' : 'pi pi-fw pi-arrow-down';
  }

  getNotificationOfLineChart() {
    let totalNotifcationMessages: NotificationMessage[] = [];
    for (let i = 0; i < this.months.length; i++) {
      if (this.userStockDataLineData()[i] > this.sp500data[i]) {
        const notifcation: NotificationMessage = {
          notificationNumber: 1,
          benchmark: this.sp500data[i],
          performance: this.userStockDataLineData()[i],
          month: this.months[i],
          message: `Portfolio performance > S&P500 (${
            this.months[i]
          } ${this.today.getFullYear()})`,
          styleClass: 'positive',
          performanceType: 'percentage',
        };
        totalNotifcationMessages.push(notifcation);
      } else if (this.userStockDataLineData()[i] > this.nasdaq100data[i]) {
        const notifcation: NotificationMessage = {
          notificationNumber: 1,
          benchmark: this.nasdaq100data[i],
          performance: this.userStockDataLineData()[i],
          month: this.months[i],
          message: `Portfolio performance > NASDAQ100 on ${
            this.months[i]
          } ${this.today.getFullYear()}`,
          styleClass: 'positive',
          performanceType: 'percentage',
        };
        totalNotifcationMessages.push(notifcation);
      }
    }
    this.notificationSvc.newNotification$.next(totalNotifcationMessages);
  }

  showRoute(symbol: string): string {
    return `Go to ${symbol} company profile`;
  }

  navigateToStockProfile(symbol: string, name: string) {
    this.router.navigate(['/stock-details', symbol], {
      queryParams: { stockName: name },
    });
  }

  // UNUSED
  goToYahoo(symbol: string) {
    const url = new URL(`https://finance.yahoo.com/quote/${symbol}`);
    url.searchParams.append('p', symbol);
    window.open(url.href, '_blank');
  }

  showUrl(symbol: string): string {
    const url = new URL(`https://finance.yahoo.com/quote/${symbol}`);
    url.searchParams.append('p', symbol);
    return url.href;
  }

  filterStock(event: any) {
    let filtered: String[] = [];
    let query = event.query;

    this.stocksData$ = this.getSvc.getStocks(query).subscribe({
      next: (res) => {
        this.filterStocks = res.data;
        // console.log('selected stock >>> ', res.data);
        for (let i = 0; i < this.filterStocks.length; i++) {
          let stock = this.filterStocks[i];
          if (stock.symbol.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            let queryStock = `${stock.symbol} | ${stock.instrument_name} (${stock.exchange})`;
            filtered.push(queryStock);
          }
        }
        this.filteredStocksSymbol = filtered;
      },
      error: (error) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'The API calls had exceed the limit of 8 calls per minute. Please wait a minute.',
        });
      },
      complete: () => {
        this.stocksData$.unsubscribe();
      },
    });
  }

  onSelectStock(event: any) {
    let stockSymbol: string = event;
    // console.log('selected stock symbol > ', stockSymbol);
    const leftBracketIndex = stockSymbol.lastIndexOf('(');
    const rightBracketIndex = stockSymbol.lastIndexOf(')');
    const exchange = stockSymbol.substring(
      leftBracketIndex + 1,
      rightBracketIndex
    );
    // console.log('exchange', exchange);
    const index: number = stockSymbol.indexOf(' | ');
    const lastIndex: number = stockSymbol.lastIndexOf(' (');
    const stockNameTrimmed = stockSymbol.substring(index + 3, lastIndex);
    let stockSymbolTrimmed = '';

    switch (exchange) {
      case 'HKEX':
        stockSymbolTrimmed = `${stockSymbol.substring(0, index)}.HK`;
        break;
      case 'TWSE':
        stockSymbolTrimmed = `${stockSymbol.substring(0, index)}.TWO`;
        break;
      case 'JPX':
        stockSymbolTrimmed = `${stockSymbol.substring(0, index)}.T`;
        break;
      case 'KRX':
        stockSymbolTrimmed = `${stockSymbol.substring(0, index)}.KS`;
        break;
      default:
        stockSymbolTrimmed = stockSymbol.substring(0, index);
        break;
    }

    // console.log('stockselected >>> ', stockSymbolTrimmed);
    // console.log('stock name selected >>> ', stockNameTrimmed);
    this.postSvc
      .updateUserStockScreenSearch(
        this.getSvc.userId,
        stockSymbolTrimmed,
        stockNameTrimmed
      )
      .then((res) => {
        console.log(res.message);
      });
    this.navigateToStockProfile(stockSymbolTrimmed, stockNameTrimmed);
  }
}

// DEPRECATED
// getStockMonthlyPerformance(
//   stockPrices: StockPrice[],
//   endOfMonth: string[]
// ): number[] {
//   let sp: number[] = [];
//   // const firstPurchasePrice: number =
//   //   stockPrices[stockPrices.length - 1].close;
//   const firstPurchasePrice: number = stockPrices[0].close;
//   for (let i = 0; i < stockPrices.length; i++) {
//     const stockPrice = stockPrices[i];
//     for (let j = 0; j < endOfMonth.length; j++) {
//       if (stockPrice.date === endOfMonth[j]) {
//         sp.push(
//           ((stockPrice.close - firstPurchasePrice) / firstPurchasePrice) * 100
//         );
//       }
//     }
//   }
//   // return sp.reverse();
//   return sp;
// }
