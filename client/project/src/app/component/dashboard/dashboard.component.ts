import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { LoginStatus, MessageResponse, UserSettings } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  documentStyle = getComputedStyle(document.documentElement);
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
          this.documentStyle.getPropertyValue('--surface-ground');
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    },
  ];

  lineData!: any;
  lineOptions!: any;
  guideLineDataForYearlyGoal!: number[];
  portfolioPerformanceData!: number[];

  savingsValue!: number;
  stocksValue!: number;
  stockChangePercentage!: number;
  cryptoValue!: number;
  investmentsValue!: number;
  propertiesValue!: number;
  miscValue!: number;
  totalValue!: number;

  goalForm!: FormGroup;

  skeletonLoading: boolean = true;

  // CATEGORIES
  categories: string[] = ['Savings', 'Investments', 'Property', 'Misc.'];
  categoriesRoutes: string[] = [
    '/savings',
    '/investment-dashboard',
    '/properties',
    '/misc',
  ];

  constructor(
    private getSvc: GetService,
    private postSvc: PostService,
    private themeSvc: ThemeService,
    private router: Router,
    private fb: FormBuilder,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle(`${this.getSvc.applicationName} | Dashboard`);
    // this.themeSvc.initiateChartSetting();
    this.username.set(localStorage.getItem('username'));
    this.goalForm = this.createGoalForm();

    // GET USER THEME IN MONGO
    this.getSvc.getUserTheme(this.getSvc.userId).then((res: UserSettings) => {
      this.themeSvc.switchTheme(res.theme);
      localStorage.setItem('theme', res.theme);
    });

    // GET USER STOCK VALUE
    // this.getSvc.getUserTotalStockValuePromise(this.getSvc.userId).then((res) => {
    //   this.stocksValue = res.value;
    //   this.totalValue = this.stocksValue; // NOTE temporarily
    // });
    this.totalValue = 0.0;
    this.stockChangePercentage = 0.0;
    this.getSvc
      .getUserTotalStockValue(this.getSvc.userId)
      .pipe(
        switchMap((res) => {
          this.stocksValue = res.value;
          this.totalValue += this.stocksValue;
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
              this.stockChangePercentage =
                (this.stocksValue - yesterdayValue) / yesterdayValue;
              return res;
            })
          );
        })
      )
      .subscribe();

    // this.stocksValue = 8000;
    // this.cryptoValue = 1200;
    this.savingsValue = 8500;
    this.investmentsValue = 6900 + 8000 + 1200;
    this.propertiesValue = 57500;
    this.miscValue = 1200;
    // this.totalValue =
    // this.savingsValue +
    // this.investmentsValue +
    // this.propertiesValue +
    // this.miscValue;

    // LINE CHART
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
        map((res) => {
          this.portfolioPerformanceData = res;
        })
      )
      .subscribe(() => {
        // console.log('line chart');
        this.skeletonLoading = false;
        this.initiateLineChart();
      });

    this.initiateDonutChart();

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
      this.postSvc.updateUserGoal(this.getSvc.userId, goal).then((res) => {
        console.log(res);
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
    return percent > 0 ? 'positive' : 'negative';
  }

  initiateDonutChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.donutData = {
      labels: this.categories,
      datasets: [
        {
          data: [
            // this.stocksValue,
            // this.cryptoValue,
            this.savingsValue,
            this.investmentsValue,
            this.propertiesValue,
            this.miscValue,
          ],
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--purple-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--purple-400'),
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
          color: documentStyle.getPropertyValue('--surface-ground'),
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
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

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
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.guideLineDataForYearlyGoal,
        },
        {
          label: 'Portfolio',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          // yAxisID: 'y1',
          tension: 0.4,
          data: this.portfolioPerformanceData,
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
          color: documentStyle.getPropertyValue('--surface-ground'),
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
