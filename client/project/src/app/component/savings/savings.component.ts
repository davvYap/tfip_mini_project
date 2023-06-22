import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Subscription, map } from 'rxjs';
import { Categories, Column, ExportColumn, Transaction } from 'src/app/models';
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
  typeOptions: any[] = [
    { label: 'Expense', value: 'Expense' },
    { label: 'Income', value: 'income' },
  ];
  postCategory$!: Subscription;

  barChartData!: any;
  barChartOptions!: any;

  // CATEGORIES
  // categories: string[] = ['Income', 'Expense', 'Balance'];
  categories!: string[];
  categoriesData!: number[];
  categoriesColor!: string[];
  categories$!: Subscription;
  categoriesRoutes: string[] = [
    '/savings',
    '/investment-dashboard',
    '/properties',
    '/misc',
  ];
  categoriesItems!: SelectItem[];
  typesItems!: SelectItem[];
  clonedTransactions: { [s: string]: Transaction } = {};

  transactions!: Transaction[];
  transactions$!: Subscription;
  transactionCol!: Column[];
  transactionExportColumns!: ExportColumn[];

  constructor(
    private router: Router,
    private getSvc: GetService,
    private fb: FormBuilder,
    private postSvc: PostService,
    private messageSvc: MessageService,
    private dialogSvc: DialogService,
    private confirmationSvc: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.categories = [];
    this.categoriesData = [];
    this.categoriesColor = [];
    this.categoryForm = this.createCategoryForm();
    this.categoriesItems = [];
    this.typesItems = [
      { label: 'Income', value: 'Income' },
      { label: 'Expense', value: 'Expense' },
    ];
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
        this.categories.map((cat) => {
          this.categoriesItems.push({
            label: cat,
            value: cat,
          });
        });
        console.log('initiate donut');
        this.initiateDonutChart();
      });

    // NOTE EXPORT FUNCTION FOR TRANSACTION TABLE
    this.transactionCol = [
      {
        header: 'Date',
        field: 'date',
        customExportHeader: 'Transaction Date',
      },
      {
        header: 'Name',
        field: 'transactionName',
      },
      {
        header: 'Amount',
        field: 'amount',
      },
      {
        header: 'Remarks',
        field: 'remarks',
      },
      {
        header: 'Category',
        field: 'categoryName',
      },
      {
        header: 'Type',
        field: 'type',
      },
    ];
    this.transactionExportColumns = this.transactionCol.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.transactions = [];
    this.transactions$ = this.getSvc
      .getUserTransaction(this.getSvc.userId)
      .pipe(
        map((trans) => {
          trans.map((tran) => {
            console.log(tran);
            this.transactions.push(tran);
          });
        })
      )
      .subscribe();

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
            // this.categories = [];
            this.ngOnInit();
          },
          error: (error) => {
            this.messageSvc.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message,
            });
          },
          complete: () => {
            this.postCategory$.unsubscribe();
          },
        });
    }
  }

  sortCategoryByDate(categories: Categories[]): Categories[] {
    const sorted = categories.sort((a, b) => {
      return b.total - a.total;
    });
    return sorted;
  }

  onRowEditInit(transaction: Transaction) {
    this.clonedTransactions[transaction.transactionId as string] = {
      ...transaction,
    };
  }

  onRowEditSave(transaction: Transaction) {
    if (transaction.amount > 0) {
      delete this.clonedTransactions[transaction.transactionId as string];
      this.messageSvc.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction is updated',
      });
    } else {
      this.messageSvc.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid transaction detials',
      });
    }
  }

  onRowEditCancel(transaction: Transaction, index: number) {
    this.transactions[index] =
      this.clonedTransactions[transaction.transactionId as string];
    delete this.clonedTransactions[transaction.transactionId as string];
  }

  clear(table: Table) {
    table.clear();
    const input1 = document.getElementById('input1') as HTMLInputElement;
    input1.value = '';
  }

  exportExcelPortfolio() {}

  newTransaction() {}

  exportPdfPortfolio() {}

  deleteSelectedTransaction(event: any, transaction: Transaction) {
    this.confirmationSvc.confirm({
      target: event.target,
      message: `Are you sure you want to delete ${transaction.transactionName} ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // this.deleteStock(purchaseId);
        this.messageSvc.add({
          severity: 'success',
          summary: 'Confirmed',
          detail: `You have deleted ${transaction.transactionName} on ${transaction.date}`,
        });
        setTimeout(() => {
          this.ngOnInit();
        }, 1000);
      },
      reject: () => {
        this.messageSvc.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'You have cancel the deletion',
        });
      },
    });
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
