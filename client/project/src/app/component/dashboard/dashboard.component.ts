import {
  Component,
  OnInit,
  signal,
  WritableSignal,
  computed,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import {
  LoginStatus,
  MessageResponse,
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
} from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  smileIcon = faFaceSmileWink;
  pointRightIcon = faHandPointRight;
  thisYear = signal(new Date().getFullYear());
  documentStyle = signal(getComputedStyle(document.documentElement));
  username: WritableSignal<string | null> = signal('visitor');
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

  lineData!: any;
  lineOptions!: any;
  guideLineDataForYearlyGoal!: number[];
  portfolioPerformanceData!: number[];
  portfolioPerformanceDataFinal: WritableSignal<number[]> = signal([]);

  savingsValue = signal(0);
  stocksValue = signal(0);
  stockChangePercentage!: number;
  cryptoValue = signal(0);
  totalValue = computed(() => {
    return this.stocksValue() + this.savingsValue() + this.cryptoValue();
  });
  investmentsValue!: number;
  propertiesValue!: number;
  miscValue!: number;

  goalForm!: FormGroup;

  skeletonLoading: boolean = true;

  quoteOfTheDay!: string;

  showAddGoal: boolean = true;

  // CATEGORIES
  categories: string[] = ['Savings', 'Investments'];
  categoriesRoutes: string[] = ['/savings', '/investment-dashboard', '/crypto'];
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

  constructor(
    private getSvc: GetService,
    private postSvc: PostService,
    private themeSvc: ThemeService,
    private router: Router,
    private fb: FormBuilder,
    private title: Title,
    private messageSvc: MessageService
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
      if (res) this.initiateChartsData();
    });

    // GET Quote of the day
    this.getSvc.getQuoteOfTheDay().then((res: quote[]) => {
      const quote = res[0];
      // console.log(quote.q);
      this.quoteOfTheDay = quote.q;
    });

    // GET USER STOCK VALUE
    // this.getSvc.getUserTotalStockValuePromise(this.getSvc.userId).then((res) => {
    //   this.stocksValue = res.value;
    //   this.totalValue = this.stocksValue; // NOTE temporarily
    // });
    this.stockChangePercentage = 0.0;
    this.getSvc
      .getUserTotalStockValue(this.getSvc.userId)
      .pipe(
        switchMap((res) => {
          this.stocksValue.set(res.value);
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
      )
      .subscribe();
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
          this.savingsValue.set(totalIncome - totalExpense);
          return of(trans);
        })
      )
      .subscribe();

    // this.stocksValue = 8000;
    // this.cryptoValue = 1200;
    this.investmentsValue = 6900 + 8000 + 1200;
    // this.totalValue =
    // this.savingsValue +
    // this.investmentsValue +
    // this.propertiesValue +
    // this.miscValue;

    // LINE CHART
    this.initiateChartsData();

    // this.getSvc.getUserGoal(this.getSvc.userId).then((res) => {
    //   this.guideLineDataForYearlyGoal = this.setYearlyGuideLine(res.goal);
    //   this.initiateLineChart();
    // });
  }

  createGoalForm(): FormGroup {
    return this.fb.group({
      goal: this.fb.control('', Validators.required),
    });
  }

  submitGoal(event: any) {
    if (event.key === 'Enter') {
      const goal: number = this.goalForm.value.goal;
      console.log(goal);
      console.log(event.key);
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
        this.initiateLineChart();
      });
      this.ngOnInit();
    }
  }

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
          console.log(this.portfolioPerformanceData);
          return of(res);
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
            console.log(this.portfolioPerformanceData);
            this.portfolioPerformanceDataFinal.set(
              this.portfolioPerformanceData
            );
            this.initiateLineChart();
          });
          return of(res);
        })
      )
      .subscribe(() => {
        // console.log('line chart');
        console.log('final', this.portfolioPerformanceDataFinal());
        this.skeletonLoading = false;
        this.initiateDonutChart();
      });
  }

  initiateDonutChart() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue('--text-color');

    this.donutData = {
      labels: this.categories,
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
          text: 'Categories',
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
          this.router.navigate([this.categoriesRoutes[index]]);
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
      labels: [
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
      ],
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
    };
  }
}
