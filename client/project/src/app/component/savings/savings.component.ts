import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Signal,
  ViewChild,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Params, Router } from '@angular/router';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SelectItem,
  SelectItemGroup,
} from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Observable, Subscription, forkJoin, map, tap } from 'rxjs';
import {
  Categories,
  Column,
  ExportColumn,
  NotificationMessage,
  Transaction,
  categoryOptionItem,
} from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { DeleteService } from 'src/app/service/delete.service';
import { UpdateService } from 'src/app/service/update.service';
import { ExportService } from 'src/app/service/export.service';
import {
  faFolderOpen,
  faHandPointRight,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/service/notification.service';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { BreakpointService } from 'src/app/service/breakpoint.service';

@Component({
  selector: 'app-savings',
  templateUrl: './savings.component.html',
  styleUrls: ['./savings.component.css'],
})
export class SavingsComponent implements OnInit, OnDestroy {
  pointRightIcon = faHandPointRight;
  editIcon = faPenToSquare;
  documentStyle = signal(getComputedStyle(document.documentElement));
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;
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
  thisYear: WritableSignal<number> = signal(new Date().getFullYear());

  totalIncome: WritableSignal<number> = signal(0);
  totalExpense: WritableSignal<number> = signal(0);
  totalBalance: Signal<number> = computed(() => {
    return this.totalIncome() - this.totalExpense();
  });

  donutData!: any;
  donutOptions!: any;
  categoryForm!: FormGroup;
  postCategory$!: Subscription;

  skeletonLoading: boolean = true;
  barChartData!: any;
  barChartOptions!: any;
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
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  incomeBarChartData!: number[];
  expenseBarChartData!: number[];
  balanceBarChartData!: number[];

  categories!: string[];
  categoriesData = signal<number[]>([]);
  categoriesColor!: string[];
  categories$!: Subscription;
  categoriesRoutes: string[] = ['income', 'expense'];
  categoriesItems!: categoryOptionItem[];
  typesItems!: SelectItem[];
  clonedTransactions: { [s: string]: Transaction } = {};
  typeOptions: any[] = [
    { label: 'Expense', value: 'expense' },
    { label: 'Income', value: 'income' },
  ];

  transactions!: Transaction[];
  transactions$!: Subscription;
  transactionCol!: Column[];
  transactionExportColumns!: ExportColumn[];

  transactionloading: boolean = true;

  dialogRef!: DynamicDialogRef;

  @ViewChild('appDialog', { static: true })
  appDialog!: ElementRef<HTMLDialogElement>;
  yearForm!: FormGroup;

  emptyIcon = faFolderOpen;
  showEmptyTransaction: boolean = false;

  constructor(
    private router: Router,
    private getSvc: GetService,
    private fb: FormBuilder,
    private postSvc: PostService,
    private messageSvc: MessageService,
    private dialogSvc: DialogService,
    private confirmationSvc: ConfirmationService,
    private themeSvc: ThemeService,
    private deleteSvc: DeleteService,
    private updateSvc: UpdateService,
    private exportSvc: ExportService,
    private elementRef: ElementRef,
    private title: Title,
    private notificationSvc: NotificationService,
    private breakpointSvc: BreakpointService
  ) {}

  ngOnInit(): void {
    this.breadcrumbItems = [
      { label: 'Savings Dashboard', routerLink: '/savings' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.title.setTitle(`${this.getSvc.applicationName} | Expense Tracker`);
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.categories = ['Income', 'Expense'];
    this.categoriesColor = [];
    this.categoriesItems = [];
    this.categoryForm = this.createCategoryForm();
    this.yearForm = this.createYearForm();

    this.themeSvc.switchTheme$.subscribe((res) => {
      if (res) {
        this.initiateBarChartData();
        this.initiateDonutChartData();
      }
    });
    this.breakpointSvc.initBreakpointObserver();

    this.categories$ = this.getSvc
      .getUserCategories(this.getSvc.userId)
      .pipe(
        map((cats: Categories[]) => {
          const sortedCats = cats.sort((a, b) =>
            a.categoryName.localeCompare(b.categoryName)
          );
          sortedCats.map((cat) => {
            this.categoriesItems.push({
              label: cat.categoryName,
              value: cat.categoryName,
              object: cat,
            });
          });
        })
      )
      .subscribe();

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

    // NOTE Initiate transaction donut chart
    this.initiateDonutChartData();

    // NOTE Initiate bar chart
    this.incomeBarChartData = [];
    this.expenseBarChartData = [];
    this.balanceBarChartData = [];
    // const thisYear: number = new Date().getFullYear();
    this.initiateBarChartData();
  }

  ngOnDestroy(): void {
    if (this.categories$) this.categories$.unsubscribe();
    if (this.transactions$) this.transactions$.unsubscribe();
  }

  createCategoryForm(): FormGroup {
    return this.fb.group({
      category: this.fb.control('', Validators.required),
      type: this.fb.control('expense', Validators.required),
    });
  }

  createYearForm(): FormGroup {
    return this.fb.group({
      year: this.fb.control(this.thisYear(), [
        Validators.required,
        Validators.min(1900),
        Validators.max(9999),
      ]),
    });
  }

  addCategory() {
    const category: string = this.categoryForm.get('category')?.value;
    const type: string = this.categoryForm.get('type')?.value;
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

  sortCategoryByDate(categories: Categories[]): Categories[] {
    const sorted = categories.sort((a, b) => {
      return b.total - a.total;
    });
    return sorted;
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

  onRowEditInit(transaction: Transaction) {
    this.clonedTransactions[transaction.transactionId as string] = {
      ...transaction,
    };
  }

  onRowEditSave(transaction: Transaction) {
    if (transaction.amount > 0) {
      this.categoriesItems.map((catObj) => {
        if (transaction.categoryName === catObj.value) {
          transaction.type = catObj.object.type;
          transaction.categoryId = catObj.object.categoryId;
        }
      });
      console.log('edited transaction > ', transaction);
      this.updateSvc
        .updateTransaction(this.getSvc.userId, transaction)
        .then((msg) => {
          delete this.clonedTransactions[transaction.transactionId as string];
          this.messageSvc.add({
            severity: 'success',
            summary: 'Success',
            detail: msg.message,
          });
          this.ngOnInit();
        })
        .catch((err) => {
          this.messageSvc.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
          });
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

  getSeverity(type: string) {
    return type === 'income' ? 'success' : 'danger';
  }

  newTransaction() {
    this.dialogRef = this.dialogSvc.open(AddTransactionComponent, {
      header: 'New Transaction',
      width: this.breakpointSvc.currentBreakpoint,
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
      data: { mortgageMonthlyPayment: null },
    });

    this.dialogRef.onClose.subscribe((msg) => {
      if (msg !== undefined) {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Successful',
          detail: msg,
        });
        this.ngOnInit();
      }
    });
  }

  newCategory() {
    this.dialogRef = this.dialogSvc.open(AddCategoryComponent, {
      header: 'New Category',
      width: this.breakpointSvc.currentBreakpoint,
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });

    this.dialogRef.onClose.subscribe((msg) => {
      if (msg !== undefined) {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Successful',
          detail: msg,
        });
        this.ngOnInit();
      }
    });
  }

  exportExcelPortfolio(): void {
    this.exportSvc.exportExcel('transTable', 'transactions');
  }

  exportPdfPortfolio(): void {
    this.exportSvc.exportPdf(
      this.transactionExportColumns,
      this.transactions,
      'transactions'
    );
  }

  deleteSelectedTransaction(event: any, tran: Transaction) {
    this.confirmationSvc.confirm({
      target: event.target,
      message: `Are you sure you want to delete ${tran.transactionName} ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteSvc
          .deleteTransaction(this.getSvc.userId, tran)
          .then((res) => {
            this.messageSvc.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: `You have deleted ${tran.transactionName} on ${tran.date}`,
            });
            setTimeout(() => {
              this.ngOnInit();
            }, 500);
          })
          .catch((err) => {
            this.messageSvc.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message,
            });
          });
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

  // Dialog
  showDialog() {
    this.appDialog.nativeElement.showModal();
  }

  closeDialog() {
    this.appDialog.nativeElement.close();
  }

  getTransaction() {
    const year: number = this.yearForm.get('year')?.value;
    // console.log('year', year);
    this.thisYear.set(year);
    this.closeDialog();
    this.showEmptyTransaction = false;
    this.ngOnInit();
    // setTimeout(() => {
    // }, 2000);
  }

  initiateDonutChartData() {
    this.transactions$ = this.getSvc
      .getUserTransaction(this.getSvc.userId, this.thisYear().toString())
      .pipe(
        tap((trans: Transaction[]) => {
          this.transactions = [];
          if (trans.length === 0) {
            this.showEmptyTransaction = true;
          }
        }),
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
        this.transactionloading = false;
        let transArr = [...this.transactions];
        //  reason of doing that is because the paginator for p-table unable to track the entries if we insert the transaction one by one
        // we have to assign the transactions one shot
        this.transactions = this.sortTransactionByDate(transArr);
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
          data: this.categoriesData(),
          // backgroundColor: this.categoriesColor,
          // hoverBackgroundColor: this.categoriesColor,
          backgroundColor: [
            this.documentStyle().getPropertyValue('--green-400'),
            this.documentStyle().getPropertyValue('--red-400'),
            // this.documentStyle().getPropertyValue('--purple-500'),
            // this.documentStyle().getPropertyValue('--yellow-500'),
          ],
          hoverBackgroundColor: [
            this.documentStyle().getPropertyValue('--green-300'),
            this.documentStyle().getPropertyValue('--red-300'),
            // this.documentStyle().getPropertyValue('--purple-400'),
            // this.documentStyle().getPropertyValue('--yellow-400'),
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
          console.log(index);
          const qp: Params = {
            type: this.categoriesRoutes[index],
            year: this.thisYear(),
          };
          this.router.navigate(['/transaction-records'], { queryParams: qp });
        }
      },
    };
  }

  initiateBarChartData() {
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
      results.forEach((trans: Transaction[]) => {
        let totalIncomePerMonth = 0;
        let totalExpensePerMonth = 0;

        trans.forEach((tran: Transaction) => {
          if (tran.type === 'income') {
            totalIncomePerMonth += tran.amount;
          } else {
            totalExpensePerMonth += tran.amount;
          }
        });

        this.incomeBarChartData.push(totalIncomePerMonth);
        this.expenseBarChartData.push(totalExpensePerMonth);
        this.balanceBarChartData.push(
          totalIncomePerMonth - totalExpensePerMonth
        );
      });

      this.initiateBarChart();
      this.getNotificationOfBalanceBarChart();
      this.skeletonLoading = false;
    });
  }

  initiateBarChart() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue('--text-color');
    const textColorSecondary = this.documentStyle().getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder =
      this.documentStyle().getPropertyValue('--surface-border');

    this.barChartData = {
      labels: this.monthsString,
      datasets: [
        {
          type: 'bar',
          label: 'Income',
          backgroundColor: this.documentStyle().getPropertyValue('--green-300'),
          data: this.incomeBarChartData,
        },
        {
          type: 'bar',
          label: 'Expense',
          backgroundColor: this.documentStyle().getPropertyValue('--red-300'),
          data: this.expenseBarChartData,
        },
        {
          type: 'bar',
          label: 'Balance',
          backgroundColor: this.documentStyle().getPropertyValue('--blue-300'),
          data: this.balanceBarChartData,
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
        customCanvasBackgroundColor: {
          color: this.documentStyle().getPropertyValue('--surface-ground'),
        },
        title: {
          display: true,
          text: `${this.thisYear()} METADATA`,
          color: textColorSecondary,
          position: 'bottom',
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

  getNotificationOfBalanceBarChart() {
    let totalNotifcationMessages: NotificationMessage[] = [];
    for (let i = 0; i < this.monthsString.length; i++) {
      if (this.balanceBarChartData[i] < 0) {
        const notifcation: NotificationMessage = {
          notificationNumber: 1,
          benchmark: this.incomeBarChartData[i],
          performance: this.expenseBarChartData[i],
          month: this.monthsString[i],
          message: `Expense > Income (${
            this.monthsString[i]
          } ${this.thisYear()})`,
          styleClass: 'negative',
          performanceType: 'number',
        };
        totalNotifcationMessages.push(notifcation);
      }
    }
    this.notificationSvc.newNotification$.next(totalNotifcationMessages);
  }

  minusYear(): void {
    const year = this.thisYear() - 1;
    this.thisYear.set(year);
    this.showEmptyTransaction = false;
    this.ngOnInit();
  }

  plusYear(): void {
    const year = this.thisYear() + 1;
    this.thisYear.set(year);
    this.showEmptyTransaction = false;
    this.ngOnInit();
  }
}
