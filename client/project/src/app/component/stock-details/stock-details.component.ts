import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import {
  Stock,
  StockCompanyProfile,
  StockIdea,
  StockPrice,
  StockSummaryDataResponse,
} from 'src/app/models';
import { DeleteService } from 'src/app/service/delete.service';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { UpdateService } from 'src/app/service/update.service';

@Component({
  selector: 'app-stock-details',
  templateUrl: './stock-details.component.html',
  styleUrls: ['./stock-details.component.css'],
})
export class StockDetailsComponent implements OnInit {
  documentStyle = signal(getComputedStyle(document.documentElement));
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;
  symbol!: string;
  stockName!: string;
  stockProfile!: StockCompanyProfile;

  skeletonLoading: boolean = true;
  lineData!: any;
  lineOptions!: any;
  stockData!: number[];
  endOfMonth!: string[];

  monthsString!: string[];

  stockSentiment!: number;
  form!: FormGroup;
  shareIdeaString!: string;
  stockIdeas$!: Observable<StockIdea[]>;
  limit!: number;
  skip!: number;

  constructor(
    private getSvc: GetService,
    private postSvc: PostService,
    private updateService: UpdateService,
    private deleteSvc: DeleteService,
    private themeSvc: ThemeService,
    private dialogSvc: DialogService,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['symbol']) {
      this.symbol = this.activatedRoute.snapshot.params['symbol'];
      this.stockName = this.activatedRoute.snapshot.queryParams['stockName'];
    }
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.title.setTitle(`${this.getSvc.applicationName} | ${this.symbol}`);
    this.breadcrumbItems = [
      { label: 'Portfolio', routerLink: '/investment-dashboard' },
      { label: `${this.symbol} Profile` },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };

    this.themeSvc.switchTheme$.subscribe((res) => {
      console.log(res);
      if (res) {
        // inititate line chart
        this.initiateLineChartData();
      }
    });

    this.monthsString = this.getSvc.monthsString;

    // GET COMPANY PROFLE
    this.getSvc
      .getStockCompanyProfile(this.symbol, this.stockName)
      .pipe(
        switchMap((profileRes: StockCompanyProfile) => {
          const observables = [];
          const observable = this.getSvc.getStockLogo(this.symbol);
          observables.push(observable);

          const profile: StockCompanyProfile = profileRes;

          forkJoin(observables).subscribe((res) => {
            profile.logo = res[0].url;
          });
          return of(profile);
        }),
        switchMap((profile: StockCompanyProfile) => {
          profile.name = this.stockName;
          profile.symbol = this.symbol;

          let observables: Observable<Stock>[] = [];
          const observable = this.getSvc.getStockPriceObservable(this.symbol);
          observables.push(observable);

          return forkJoin(observables).pipe(
            map((stockArr) => {
              profile.closePrice = parseFloat(stockArr[0].price);
              return profile;
            })
          );
        }),
        switchMap((profile) => {
          let observables: Observable<StockSummaryDataResponse>[] = [];
          const observable = this.getSvc.getStockSummaryData(this.symbol);
          observables.push(observable);

          return forkJoin(observables).pipe(
            map((summaryArr) => {
              profile.stockSummaryData = summaryArr[0].summaryDetail;
              return profile;
            })
          );
        })
      )
      .subscribe((profile) => {
        this.stockProfile = profile;
        // console.log(profile);
      });

    // USER IDEAS
    // this.stockSentiment = 4;
    this.limit = 20;
    this.skip = 0;
    this.form = this.createForm();
    this.shareIdeaString = `Share your idea on $${this.symbol}`;
    this.initiateStockIdeasData();

    // GET LINE CHART DATA
    this.endOfMonth = this.getEndOfMonth();
    this.initiateLineChartData();
  }

  getStartDate(): string {
    return this.getSvc.getStartDateOfYear();
  }

  getCurrentDate(): string {
    return this.getSvc.getCurrentDate();
  }

  getEndOfMonth(): string[] {
    return this.getSvc.getEndOfMonthFinal();
  }

  getStockMonthlyPerformance(
    stockPrices: StockPrice[],
    endOfMonth: string[]
  ): number[] {
    let sp: number[] = [];
    // const firstPurchasePrice: number =
    //   stockPrices[stockPrices.length - 1].close;
    const firstPurchasePrice: number = stockPrices[0].close;
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
    // return sp.reverse();
    return sp;
  }

  createForm(): FormGroup {
    return this.fb.group({
      idea: this.fb.control('', Validators.required),
      sentiment: this.fb.control(0, Validators.required),
    });
  }

  initiateStockIdeasData() {
    this.stockIdeas$ = this.getSvc
      .getStockIdeas(this.symbol, this.limit, this.skip)
      .pipe(
        tap((ideas) => {
          let sentiment = 0;
          let totalIdeas = 0;
          ideas.map((idea) => {
            sentiment += idea.sentiment;
            totalIdeas++;
          });
          this.stockSentiment = sentiment / totalIdeas;
          // console.log(sentiment, totalIdeas, this.stockSentiment);
        })
      );
  }

  isUserIdea(id: string): boolean {
    return id === this.getSvc.userId;
  }

  postNewIdea() {
    const idea: StockIdea = this.form.value as StockIdea;
    idea.userId = this.getSvc.userId;
    idea.fullName = `${localStorage.getItem(
      'firstname'
    )}  ${localStorage.getItem('lastname')}`;
    idea.profileIcon = `${localStorage.getItem('profileIcon')}`;
    // console.log(idea);
    this.postSvc
      .newStockIdea(this.symbol, idea)
      .then((res) => {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message,
        });
        this.form = this.createForm();
        this.initiateStockIdeasData();
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      });
  }

  deleteIdea(ideaId: string) {
    this.deleteSvc
      .deleteStockIdea(this.symbol, ideaId)
      .then((msg) => {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Success',
          detail: msg.message,
        });
        this.initiateStockIdeasData();
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      });
  }

  initiateLineChartData() {
    let observables: Observable<StockPrice[]>[] = [];
    const observable = this.getSvc.getStockMonthlyPrice(
      this.symbol,
      this.getStartDate(),
      this.getCurrentDate()
    );
    observables.push(observable);

    forkJoin(observables)
      .pipe(
        map((stockPrices: StockPrice[][]) => {
          const stockPrice: StockPrice[] = stockPrices[0];
          for (let i = 0; i < stockPrice.length; i++) {
            const stock = stockPrice[i];
            const date = stock.date.substring(0, 10);
            stock.date = date;
          }
          let endOfMonth: string[] = [...this.endOfMonth];
          let count = 0;
          endOfMonth.map((date) => {
            if (date === this.getCurrentDate()) count++;
          });
          if (count === 0) {
            endOfMonth.push(this.getCurrentDate());
          }
          // console.log('end of month ', endOfMonth);

          const performance: number[] = this.getStockMonthlyPerformance(
            stockPrice,
            endOfMonth
          );
          this.stockData = performance;
          this.skeletonLoading = false;
          this.initiateLineChart();
          // console.log('stocks data > ', this.stockData);
        })
      )
      .subscribe();
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
      labels: this.getSvc.monthsString,
      datasets: [
        {
          label: `${this.symbol}`,
          fill: true,
          borderColor: this.documentStyle().getPropertyValue('--primary-color'),
          // yAxisID: 'y',
          tension: 0.4,
          data: this.stockData,
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
          onClick: () => {},
        },
        customCanvasBackgroundColor: {
          color: this.documentStyle().getPropertyValue('--surface-ground'),
        },
        title: {
          display: true,
          text: `${this.symbol} ${new Date().getFullYear()} Performance`,
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
}
