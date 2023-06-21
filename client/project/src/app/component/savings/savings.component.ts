import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription, map } from 'rxjs';
import { Categories } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';

@Component({
  selector: 'app-savings',
  templateUrl: './savings.component.html',
  styleUrls: ['./savings.component.css'],
})
export class SavingsComponent implements OnInit {
  totalIncome!: number;
  totalExpense!: number;
  totalBalance!: number;

  donutData!: any;
  donutOptions!: any;
  categoryForm!: FormGroup;
  stateOptions: any[] = [
    { label: 'Expense', value: 'expense' },
    { label: 'Income', value: 'income' },
  ];
  postCategory$!: Subscription;

  barChartData!: any;
  barChartOptions!: any;

  // CATEGORIES
  // categories: string[] = ['Income', 'Expense', 'Balance'];
  categories: string[] = [];
  categoriesData: number[] = [];
  categoriesColor: string[] = [];
  categories$!: Subscription;
  categoriesRoutes: string[] = [
    '/savings',
    '/investment-dashboard',
    '/properties',
    '/misc',
  ];

  constructor(
    private router: Router,
    private getSvc: GetService,
    private fb: FormBuilder,
    private postSvc: PostService,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.createCategoryForm();
    this.categories$ = this.getSvc
      .getUserCategories(this.getSvc.userId)
      .pipe(
        map((cats) => {
          cats.map((cat) => {
            this.categories.push(cat.categoryName);
            this.categoriesData.push(Math.floor(Math.random() * 100));
            const randomColor = Math.floor(Math.random() * 16777215).toString(
              16
            );
            this.categoriesColor.push('#' + randomColor);
          });
        })
      )
      .subscribe((res) => {
        console.log('initiate donut');
        this.initiateDonutChart();
      });

    setTimeout(() => {
      this.totalIncome = 10000;
      this.totalExpense = 5893.5;
      this.totalBalance = this.totalIncome - this.totalExpense;
    }, 500);

    setTimeout(() => {
      // this.categoriesData = [
      //   this.totalIncome,
      //   this.totalExpense,
      //   this.totalExpense,
      // ];

      // this.initiateDonutChart();
      this.initiateBarChart();
    }, 1000);
  }

  createCategoryForm(): FormGroup {
    return this.fb.group({
      category: this.fb.control('', Validators.required),
      type: this.fb.control('expense', Validators.required),
    });
  }

  addCategory(event: any) {
    if (event.key === 'Enter') {
      let category: string = this.categoryForm.get('category')?.value;
      let type: string = this.categoryForm.get('type')?.value;
      console.log(category, type);
      this.postCategory$ = this.postSvc
        .addCategory(this.getSvc.userId, category, type)
        .subscribe({
          next: (message) => {
            this.messageSvc.add({
              severity: 'success',
              summary: 'Success',
              detail: message.message,
            });
            this.categories = [];
            this.ngOnInit();
          },
          error: (error) => {
            this.messageSvc.add({
              severity: 'success',
              summary: 'Success',
              detail: error.message,
            });
          },
          complete: () => {
            this.postCategory$.unsubscribe();
          },
        });
    }
  }

  sortStockByDate(categories: Categories[]): Categories[] {
    const sorted = categories.sort((a, b) => {
      return b.total - a.total;
    });
    return sorted;
  }

  initiateDonutChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');

    this.donutData = {
      labels: this.categories,
      datasets: [
        {
          data: this.categoriesData,
          backgroundColor: this.categoriesColor,
          hoverBackgroundColor: this.categoriesColor,
          // backgroundColor: [
          //   documentStyle.getPropertyValue('--blue-500'),
          //   documentStyle.getPropertyValue('--green-500'),
          //   documentStyle.getPropertyValue('--purple-500'),
          //   documentStyle.getPropertyValue('--yellow-500'),
          // ],
          // hoverBackgroundColor: [
          //   documentStyle.getPropertyValue('--blue-400'),
          //   documentStyle.getPropertyValue('--green-400'),
          //   documentStyle.getPropertyValue('--purple-400'),
          //   documentStyle.getPropertyValue('--yellow-400'),
          // ],
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
            // color: textColor,
            color: '#fff',
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
          color: '#fff',
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

  initiateBarChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barChartData = {
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
          type: 'bar',
          label: 'Income',
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          data: [50, 25, 12, 48, 90, 76, 42],
        },
        {
          type: 'bar',
          label: 'Expense',
          backgroundColor: documentStyle.getPropertyValue('--purple-500'),
          data: [21, 84, 24, 75, 37, 65, 34],
        },
        {
          type: 'bar',
          label: 'Balance',
          backgroundColor: documentStyle.getPropertyValue('--yellow-500'),
          data: [41, 52, 24, 74, 23, 21, 32],
        },
      ],
    };

    this.barChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }
}
