import {
  Component,
  OnInit,
  signal,
  WritableSignal,
  computed,
  Signal,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { Chart } from 'chart.js';
import {
  Observable,
  Subscription,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  LoginStatus,
  MessageResponse,
  NotificationMessage,
  PurchasedStocksCount,
  SoldStock,
  StockLogo,
  StonkStockPrice,
  Transaction,
  UserSettings,
  quote,
} from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { Title } from '@angular/platform-browser';
import {
  faFaceSmileWink,
  faHandPointRight,
  faRepeat,
} from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  smileIcon = faFaceSmileWink;
  pointRightIcon = faHandPointRight;
  switchIcon = faRepeat;
  thisYear = signal(new Date().getFullYear());
  currMonth = signal(new Date().getMonth());
  documentStyle = signal(getComputedStyle(document.documentElement));
  username: WritableSignal<string | null> = signal('visitor');
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
          this.documentStyle().getPropertyValue('--surface-overlay');
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    },
  ];
  userGreeting!: string;

  donutDataOverall!: any;
  donutOptionsOverall!: any;
  donutDataInvestment!: any;
  donutOptionsInvestment!: any;
  donutDataSavings!: any;
  donutOptionsSavings!: any;

  stockCountDonutSymbol!: string[];
  stockCountDonutData: WritableSignal<number[]> = signal([]);
  categoriesColor!: string[];
  stocksCount!: PurchasedStocksCount[];
  stocksCount$!: Subscription;
  soldStocks!: SoldStock[];
  soldStocks$!: Subscription;

  categoriesData = signal<number[]>([]);
  transactions!: Transaction[];
  transactions$!: Subscription;
  totalIncome: WritableSignal<number> = signal(0);
  totalExpense: WritableSignal<number> = signal(0);
  totalBalance: Signal<number> = computed(() => {
    return this.totalIncome() - this.totalExpense();
  });

  private _lineData!: any;
  public get lineData(): any {
    return this._lineData;
  }
  public set lineData(value: any) {
    this._lineData = value;
  }
  lineOptions!: any;
  guideLineDataForYearlyGoal!: number[];
  portfolioPerformanceData!: number[];
  portfolioPerformanceDataFinal: WritableSignal<number[]> = signal([]);

  savingsValueYearly = signal(0);
  savingsValue = signal(0);
  stocksValue = signal(0);
  stockChangePercentage!: number;
  cryptoValue = signal(0);
  totalValue = computed(() => {
    return this.stocksValue() + this.savingsValue() + this.cryptoValue();
  });
  stocksRealizedProfit = signal(0);
  stocksUnrealizedProfit = signal(0);
  totalStocksValue = computed(() => {
    return this.stocksRealizedProfit() + this.stocksValue();
  });

  goalForm!: FormGroup;

  skeletonLoading: boolean = true;

  quoteOfTheDay!: string;

  showAddGoal: boolean = true;

  showYearSavings: boolean = true;
  showTotalExpense: boolean = false;
  showTotalIncome: boolean = false;
  averageMonthlyIncome = signal(0);
  averageMonthlyExpense = signal(0);

  // CATEGORIES
  generalCategories: string[] = ['Savings', 'Investments'];
  generalCategoriesRoutes: string[] = [
    '/savings',
    '/investment-dashboard',
    '/crypto',
  ];

  savingsCategories: string[] = ['Income', 'Expense'];
  savingsCategoriesRoutes: string[] = ['income', 'expense'];

  monthsStr: string[] = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ];

  monthsString: string[] = [
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

  @ViewChild('appDialog', { static: true })
  appDialog!: ElementRef<HTMLDialogElement>;

  constructor(
    private getSvc: GetService,
    private postSvc: PostService,
    private themeSvc: ThemeService,
    private router: Router,
    private fb: FormBuilder,
    private title: Title,
    private messageSvc: MessageService,
    private notificationSvc: NotificationService
  ) {}

  ngOnInit(): void {
    this.title.setTitle(`${this.getSvc.applicationName} | Dashboard`);
    // this.themeSvc.initiateChartSetting();
    this.username.set(
      `${localStorage.getItem('firstname')} ${localStorage.getItem('lastname')}`
    );
    this.goalForm = this.createGoalForm();

    // GET USER THEME IN MONGO
    this.getSvc.getUserTheme(this.getSvc.userId).then((res: UserSettings) => {
      this.themeSvc.switchTheme(res.theme);
      localStorage.setItem('theme', res.theme);
    });

    this.themeSvc.switchTheme$.subscribe((res) => {
      console.log('change theme', res);
      if (res) {
        this.initiateChartsData();
        this.initiateStockCount();
        this.initiateDonutChartData();
      }
    });

    // GET Greetings
    this.userGreeting = this.getSvc.getCurrentTime();

    // GET Quote of the day
    this.getSvc.getQuoteOfTheDay().then((res: quote[]) => {
      const quote = res[0];
      // console.log(quote.q);
      this.quoteOfTheDay = quote.q;
    });

    // INVESTMENT DONUT CHART
    this.stockCountDonutSymbol = [];
    this.categoriesColor = [];
    this.stocksCount = [];
    // this.initiateStockCount();

    // STOCKS REALIZED PROFIT
    this.soldStocks$ = this.getSvc
      .getUserSoldStocks(this.getSvc.userId)
      .subscribe((stks: SoldStock[]) => {
        this.stocksRealizedProfit.set(this.calculateRealizedProfit(stks));
      });

    // SAVINGS DONUT CHART
    this.transactions = [];
    setTimeout(() => {
      this.initiateDonutChartData();
    }, 200);

    // LINE CHART & USER TOTAL STOCK VALUE & STOCK COUNT FOR DONUT CHART
    this.initiateChartsData();

    // USER TOTAL STOCK VALUE
    this.stockChangePercentage = 0.0;
    // this.calculateUserStockValue();

    // YEARLY TRANSACTION
    this.getSvc
      .getUserTransaction(this.getSvc.userId, this.thisYear().toString())
      .pipe(
        switchMap((trans: Transaction[]) => {
          let totalIncome = 0;
          let totalExpense = 0;
          trans.map((tran) => {
            if (tran.type === 'income') {
              totalIncome += tran.amount;
            } else {
              totalExpense += tran.amount;
            }
          });
          this.savingsValueYearly.set(totalIncome - totalExpense);
          const totalMonths = this.currMonth() + 1;
          this.averageMonthlyExpense.set(totalExpense / totalMonths);
          this.averageMonthlyIncome.set(totalIncome / totalMonths);
          return of(trans);
        })
      )
      .subscribe();

    // OVERALL TRANSACTION
    this.getSvc
      .getUserAllTransaction(this.getSvc.userId)
      .pipe(
        switchMap((trans: Transaction[]) => {
          let totalIncome = 0;
          let totalExpense = 0;
          trans.map((tran) => {
            if (tran.type === 'income') {
              totalIncome += tran.amount;
            } else {
              totalExpense += tran.amount;
            }
          });
          this.savingsValue.set(totalIncome - totalExpense);
          return of(trans);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.soldStocks$) this.soldStocks$.unsubscribe;
    if (this.stocksCount$) this.stocksCount$.unsubscribe;
    if (this.transactions$) this.transactions$.unsubscribe;
  }

  createGoalForm(): FormGroup {
    return this.fb.group({
      goal: this.fb.control('', Validators.required),
    });
  }

  // Dialog
  showDialog() {
    this.appDialog.nativeElement.showModal();
  }

  closeDialog() {
    this.appDialog.nativeElement.close();
  }

  submitGoal() {
    const goal: number = this.goalForm.value.goal;

    this.postSvc
      .updateUserGoal(this.getSvc.userId, goal)
      .then((res) => {
        // console.log(res);
        this.showAddGoal = false;
        this.messageSvc.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message,
        });
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      });
    this.getSvc.getUserGoalPromise(this.getSvc.userId).then((res) => {
      this.guideLineDataForYearlyGoal = this.setYearlyGuideLine(res.goal);
      this.ngOnInit();
    });
    this.closeDialog();
  }

  // submitGoal(event: any) {
  //   if (event.key === 'Enter') {
  //     const goal: number = this.goalForm.value.goal;
  //     console.log(goal);
  //     console.log(event.key);
  //     this.postSvc
  //       .updateUserGoal(this.getSvc.userId, goal)
  //       .then((res) => {
  //         // console.log(res);
  //         this.showAddGoal = false;
  //         this.messageSvc.add({
  //           severity: 'success',
  //           summary: 'Success',
  //           detail: res.message,
  //         });
  //       })
  //       .catch((err) => {
  //         this.messageSvc.add({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: err.error.message,
  //         });
  //       });
  //     this.getSvc.getUserGoalPromise(this.getSvc.userId).then((res) => {
  //       this.guideLineDataForYearlyGoal = this.setYearlyGuideLine(res.goal);
  //       this.initiateLineChart();
  //     });
  //     this.ngOnInit();
  //   }
  // }

  setYearlyGuideLine(goal: number): number[] {
    let months = 12;
    let yearlyGoal: number[] = [];
    for (let i = 0; i < months; i++) {
      let monthlyGoal = (goal / months) * (i + 1);
      yearlyGoal.push(monthlyGoal);
    }
    return yearlyGoal;
  }

  getColor(percent: number): string {
    return percent >= 0 ? 'positive' : 'negative';
  }

  getProfitColorClass(unrealizedProfit: number): string {
    return unrealizedProfit > 0 ? 'positive' : 'negative';
  }

  calculateRealizedProfit(soldStocks: SoldStock[]): number {
    let total: number = 0;
    soldStocks.map((stock) => {
      total += stock.netProfit;
    });
    return total;
  }

  calculateUnrealizedProfit(stockCounts: PurchasedStocksCount[]): number {
    let total: number = 0.0;
    stockCounts.map((stockCount) => {
      total += stockCount.marketPrice - stockCount.cost;
    });
    return total;
  }

  calculateUserStockValue(): Observable<any> {
    return this.getSvc.getUserTotalStockValue(this.getSvc.userId).pipe(
      switchMap((res) => {
        this.stocksValue.set(res.value);
        // console.log('calculating', this.stocksValue());
        return of(res);
      }),
      switchMap((res) => {
        let observables: Observable<MessageResponse>[] = [];
        const observable = this.getSvc.getUserYesterdayTotalStockValue(
          this.getSvc.userId
        );
        observables.push(observable);
        return forkJoin(observables).pipe(
          map((res2: MessageResponse[]) => {
            const msgRes: MessageResponse = res2[0];
            const yesterdayValue = msgRes.value;
            if (yesterdayValue === 0) {
              this.stockChangePercentage = 0;
            } else {
              this.stockChangePercentage =
                (this.stocksValue() - yesterdayValue) / yesterdayValue;
            }
            return res;
          })
        );
      })
    );
    // .subscribe();
  }

  initiateChartsData() {
    this.getSvc
      .getUserStockMonthlyValue(this.getSvc.userId, new Date().getFullYear())
      .pipe(
        switchMap((res) => {
          let observables = [];
          const observable = this.getSvc.getUserGoal(this.getSvc.userId);
          observables.push(observable);
          return forkJoin(observables).pipe(
            map((goal) => {
              this.guideLineDataForYearlyGoal = this.setYearlyGuideLine(
                goal[0].goal
              );
              return res;
            })
          );
        }),
        switchMap((res) => {
          this.portfolioPerformanceData = res;
          // console.log('user stock data', this.portfolioPerformanceData);
          return of(res);
        }),
        switchMap((res) => {
          // CALCULATE USER TOTAL STOCK VALUE
          return new Observable((observer) => {
            this.calculateUserStockValue()
              .pipe(
                finalize(() => {
                  observer.next(res);
                  observer.complete();
                })
              )
              .subscribe();
          });
        }),
        switchMap((res) => {
          // Create an array of observables
          const observables: Observable<Transaction[]>[] = this.monthsStr.map(
            (month) => {
              return this.getSvc.getUserTransactionBasedOnMonthYear(
                this.getSvc.userId,
                month,
                this.thisYear().toString()
              );
            }
          );
          // Wait for all observables to complete using forkJoin
          forkJoin(observables).subscribe((results: Transaction[][]) => {
            let index = 0;
            let totalBalancePreviousMonth = 0;
            results.forEach((transEachMonth: Transaction[]) => {
              let totalIncomePerMonth = 0;
              let totalExpensePerMonth = 0;
              transEachMonth.forEach((tran: Transaction) => {
                if (tran.type === 'income') {
                  totalIncomePerMonth += tran.amount;
                } else {
                  totalExpensePerMonth += tran.amount;
                }
              });
              const totalBalancePerMonth =
                totalIncomePerMonth - totalExpensePerMonth;
              const totalAccumulateBalance =
                totalBalancePerMonth + totalBalancePreviousMonth;
              totalBalancePreviousMonth += totalBalancePerMonth;
              if (totalAccumulateBalance !== 0) {
                this.portfolioPerformanceData[index] =
                  this.portfolioPerformanceData[index] + totalAccumulateBalance;
              }
              index++;
            });
            console.log('user performance', this.portfolioPerformanceData);
            this.portfolioPerformanceDataFinal.set(
              this.portfolioPerformanceData
            );
            this.initiateLineChart();
            this.getNotificationOfLineChart();
          });
          return of(res);
        })
      )
      .subscribe(() => {
        // console.log('line chart');
        this.skeletonLoading = false;
        this.initiateDonutChartOverall();
        this.initiateStockCount();
      });
  }

  initiateDonutChartOverall() {
    // const documentStyle = getComputedStyle(document.documentElement);
    console.log('stock value', this.stocksValue());
    console.log('savings value', this.savingsValue());
    const textColor = this.documentStyle().getPropertyValue('--text-color');

    this.donutDataOverall = {
      labels: this.generalCategories,
      datasets: [
        {
          data: [this.savingsValue(), this.stocksValue(), this.cryptoValue()],
          backgroundColor: [
            this.documentStyle().getPropertyValue('--blue-500'),
            this.documentStyle().getPropertyValue('--yellow-500'),
            this.documentStyle().getPropertyValue('--green-500'),
            this.documentStyle().getPropertyValue('--purple-500'),
          ],
          hoverBackgroundColor: [
            this.documentStyle().getPropertyValue('--blue-400'),
            this.documentStyle().getPropertyValue('--yellow-400'),
            this.documentStyle().getPropertyValue('--green-400'),
            this.documentStyle().getPropertyValue('--purple-400'),
          ],
        },
      ],
      doughnutlabel: [],
    };

    this.donutOptionsOverall = {
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
          text: 'Overall',
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

      onClick: (event: any, activeElements: any) => {
        if (activeElements.length > 0) {
          const index = activeElements[0].index;
          // console.log(index);
          this.router.navigate([this.generalCategoriesRoutes[index]]);
        }
      },
    };
  }

  // HERE USING STOCKSTOCKPRICE FOR DONUT CHART
  initiateStockCount() {
    console.log('initate stock count for donut chart');
    this.stocksCount$ = this.getSvc
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
        this.stocksUnrealizedProfit.set(
          this.calculateUnrealizedProfit(stockCounts)
        );

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
        this.initiateDonutChartInvestment();
      });
  }

  sortStockByMarketPrice(
    PurchasedStocks: PurchasedStocksCount[]
  ): PurchasedStocksCount[] {
    const sorted = PurchasedStocks.sort((a, b) => {
      return b.marketPrice - a.marketPrice;
    });
    return sorted;
  }

  initiateDonutChartInvestment() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue('--text-color');

    this.donutDataInvestment = {
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

    this.donutOptionsInvestment = {
      cutout: '60%',
      hoverOffset: 10,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: textColor,
            // color: '#000000',
            padding: 5,
          },
        },
        title: {
          display: true,
          text: 'Investment',
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
      onClick: (event: any, activeElements: any) => {
        if (activeElements.length > 0) {
          this.router.navigate(['/investment-dashboard']);
        }
      },
    };
  }

  initiateDonutChartData() {
    this.transactions$ = this.getSvc
      .getUserTransaction(this.getSvc.userId, this.thisYear().toString())
      .pipe(
        map((trans: Transaction[]) => {
          trans.map((tran) => {
            // console.log(tran);
            this.transactions.push(tran);
          });
          return trans;
        }),
        map((trans: Transaction[]) => {
          let totalIncome: number = 0.0;
          let totalExpense: number = 0.0;

          trans.map((tran) => {
            if (tran.type === 'income') {
              totalIncome += tran.amount;
            } else {
              totalExpense += tran.amount;
            }
          });
          this.totalIncome.set(totalIncome);
          this.totalExpense.set(totalExpense);
          this.categoriesData.set([totalIncome, totalExpense]);
        })
      )
      .subscribe(() => {
        let transArr = [...this.transactions];
        //  reason of doing that is because the paginator for p-table unable to track the entries if we insert the transaction one by one
        // we have to assign the transactions one shot
        this.transactions = this.sortTransactionByDate(transArr);
        this.initiateDonutChartSavings();
      });
  }

  sortTransactionByDate(trans: Transaction[]): Transaction[] {
    trans.map((tran) => {
      const dateStr = tran.date;
      const dateNum = new Date(dateStr);
      const timestamp = dateNum.getTime();
      tran.dateNum = timestamp;
    });
    const sorted = trans.sort((a, b) => {
      return b.dateNum - a.dateNum;
    });
    return sorted;
  }

  initiateDonutChartSavings() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue('--text-color');

    this.donutDataSavings = {
      labels: this.savingsCategories,
      datasets: [
        {
          data: this.categoriesData(),
          // backgroundColor: this.categoriesColor,
          // hoverBackgroundColor: this.categoriesColor,
          backgroundColor: [
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--red-400'),
            // documentStyle.getPropertyValue('--purple-500'),
            // documentStyle.getPropertyValue('--yellow-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--green-300'),
            documentStyle.getPropertyValue('--red-300'),
            // documentStyle.getPropertyValue('--purple-400'),
            // documentStyle.getPropertyValue('--yellow-400'),
          ],
        },
      ],
      doughnutlabel: [],
    };

    this.donutOptionsSavings = {
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
          text: 'Transactions',
          position: 'bottom',
          padding: {
            top: 20,
            bottom: 0,
          },
          // color: '#fff',
          color: textColor,
        },
        customCanvasBackgroundColor: {
          color: documentStyle.getPropertyValue('--surface-ground'),
        },
      },
      onClick: (event: any, activeElements: any) => {
        if (activeElements.length > 0) {
          const index = activeElements[0].index;
          console.log(index);
          const qp: Params = {
            type: this.savingsCategoriesRoutes[index],
            year: this.thisYear(),
          };
          this.router.navigate(['/transaction-records'], { queryParams: qp });
        }
      },
    };
  }

  initiateLineChart() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue(
      '--primary-color-text'
    );
    const textColorSecondary = this.documentStyle().getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder =
      this.documentStyle().getPropertyValue('--surface-border');

    this.lineData = {
      labels: this.monthsString,
      datasets: [
        {
          label: 'Yearly Goal',
          fill: false,
          borderColor: this.documentStyle().getPropertyValue('--blue-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.guideLineDataForYearlyGoal,
        },
        {
          label: 'Assets Value',
          fill: true,
          borderColor: this.documentStyle().getPropertyValue('--green-500'),
          // yAxisID: 'y1',
          tension: 0.4,
          data: this.portfolioPerformanceDataFinal(),
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
            color: textColorSecondary,
            // color: '#000000 ',
          },
        },
        customCanvasBackgroundColor: {
          color: this.documentStyle().getPropertyValue('--surface-ground'),
        },
        title: {
          display: true,
          text: `${this.thisYear()} Target Goal`,
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
      hoverRadius: 15,
      interaction: {
        intersect: false,
        mode: 'index',
      },
    };
  }
  toggleMonthlyAverage() {
    if (this.showYearSavings) {
      this.showYearSavings = false;
      this.showTotalIncome = true;
      this.showTotalExpense = false;
    } else if (this.showTotalIncome) {
      this.showTotalIncome = false;
      this.showTotalExpense = true;
      this, (this.showYearSavings = false);
    } else {
      this.showYearSavings = true;
      this.showTotalIncome = false;
      this.showTotalExpense = false;
    }
  }

  haveTransactions(): boolean {
    return this.totalIncome() > 0 || this.totalExpense() > 0;
  }

  getNotificationOfLineChart() {
    let totalNotifcationMessages: NotificationMessage[] = [];
    for (let i = 0; i < this.monthsString.length; i++) {
      if (
        this.portfolioPerformanceDataFinal()[i] >=
        this.guideLineDataForYearlyGoal[i]
      ) {
        const notifcation: NotificationMessage = {
          notificationNumber: 1,
          benchmark: this.guideLineDataForYearlyGoal[i],
          performance: this.portfolioPerformanceDataFinal()[i],
          month: this.monthsString[i],
          message: `Target goal achived (${
            this.monthsString[i]
          } ${this.thisYear()})`,
          styleClass: 'positive',
          performanceType: 'number',
        };
        totalNotifcationMessages.push(notifcation);
      }
    }
    this.notificationSvc.newNotification$.next(totalNotifcationMessages);
  }
}
