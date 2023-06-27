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
import { Subscription, map } from 'rxjs';
import {
  Categories,
  Column,
  ExportColumn,
  Transaction,
  categoryOptionItem,
} from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { ExportService } from 'src/app/service/export.service';
import { Table } from 'primeng/table';
import { UpdateService } from 'src/app/service/update.service';
import { DeleteService } from 'src/app/service/delete.service';

@Component({
  selector: 'app-transaction-records',
  templateUrl: './transaction-records.component.html',
  styleUrls: ['./transaction-records.component.css'],
})
export class TransactionRecordsComponent implements OnInit, OnDestroy {
  startDate: WritableSignal<string> = signal(this.getSvc.getStartDateOfYear());
  endDate: WritableSignal<string> = signal(
    new Date().toISOString().split('T')[0]
  );
  typeOfRecord: WritableSignal<string> = signal('all');
  totalIncome: WritableSignal<number> = signal(0);
  totalExpense: WritableSignal<number> = signal(0);
  totalBalance: Signal<number> = computed(() => {
    return this.totalIncome() - this.totalExpense();
  });

  dateForm!: FormGroup;
  donutData!: any;
  donutOptions!: any;

  transactions!: Transaction[];
  transactions$!: Subscription;
  transactionCol!: Column[];
  transactionExportColumns!: ExportColumn[];
  transactionloading: boolean = true;

  categories!: string[];
  categoriesDonutData = signal<number[]>([]);
  categoriesColor!: string[];
  categories$!: Subscription;

  categoriesItems!: categoryOptionItem[];
  typesItems!: SelectItem[];
  clonedTransactions: { [s: string]: Transaction } = {};

  @ViewChild('appDialog', { static: true })
  appDialog!: ElementRef<HTMLDialogElement>;

  emptyIcon = faFolderOpen;
  dialogRef!: DynamicDialogRef;

  skeletonLoading: boolean = true;
  barChartData!: any;
  barChartOptions!: any;
  finalBarChartLabels!: string[];
  finalBarChartData!: number[];

  constructor(
    private themeSvc: ThemeService,
    private getSvc: GetService,
    private fb: FormBuilder,
    private dialogSvc: DialogService,
    private messageSvc: MessageService,
    private title: Title,
    private exportSvc: ExportService,
    private updateSvc: UpdateService,
    private confirmationSvc: ConfirmationService,
    private deleteSvc: DeleteService
  ) {}

  ngOnInit(): void {
    this.title.setTitle(`${this.getSvc.applicationName} | Expense Tracker`);
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    const documentStyle = getComputedStyle(document.documentElement);
    this.dateForm = this.createForm();
    this.categories = [];
    this.categoriesItems = [];
    this.categoriesColor = [];
    this.finalBarChartData = [];
    this.finalBarChartLabels = [];

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
      .subscribe(() => {
        console.log(this.categoriesItems);
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

    // get user transactions
    this.transactions = [];
    this.transactions$ = this.getSvc
      .getUserTransactionBasedOnDates(
        this.getSvc.userId,
        this.startDate(),
        this.endDate()
      )
      .pipe(
        map((trans: Transaction[]) => {
          trans.map((tran) => {
            if (
              tran.type === this.typeOfRecord() ||
              this.typeOfRecord() === 'all'
            )
              this.transactions.push(tran);
          });
          return trans;
        }),
        map((trans: Transaction[]) => {
          let totalIncome: number = 0.0;
          let totalExpense: number = 0.0;
          if (this.typeOfRecord() === 'all') {
            trans.map((tran) => {
              if (tran.type === 'income') {
                totalIncome += tran.amount;
              } else {
                totalExpense += tran.amount;
              }
            });
            this.totalIncome.set(totalIncome);
            this.totalExpense.set(totalExpense);
            this.categories = ['Income', 'Expense', 'Balance'];
            this.categoriesColor = [
              documentStyle.getPropertyValue('--green-400'),
              documentStyle.getPropertyValue('--red-400'),
              documentStyle.getPropertyValue('--blue-400'),
            ];

            this.categoriesDonutData.set([
              totalIncome,
              totalExpense,
              this.totalBalance(),
            ]);
            this.finalBarChartLabels = ['Income', 'Expense', 'Balance'];
            this.finalBarChartData.push(
              totalIncome,
              totalExpense,
              this.totalBalance()
            );
          } else if (this.typeOfRecord() === this.typeOfRecord()) {
            this.categoriesDonutData.set([]);
            trans.map((tran) => {
              if (tran.type === this.typeOfRecord()) {
                // check if the data already include this transaction category
                if (!this.categories.includes(tran.categoryName)) {
                  this.categories.push(tran.categoryName);
                  this.categoriesDonutData.mutate((categoriesArray) =>
                    categoriesArray.push(tran.amount)
                  );
                  const randomColor = Math.floor(
                    Math.random() * 16777215
                  ).toString(16);

                  const latestIndex = this.categories.length;
                  this.categoriesColor.push(this.getSvc.getColors(latestIndex));
                  this.finalBarChartLabels.push(tran.categoryName);
                  this.finalBarChartData.push(tran.amount);
                } else {
                  const catNameIndex: number = this.categories.indexOf(
                    tran.categoryName
                  );
                  this.categoriesDonutData()[catNameIndex] += tran.amount;
                  this.finalBarChartData[catNameIndex] += tran.amount;
                }
                totalIncome += tran.amount;
                totalExpense += tran.amount;
                this.totalIncome.set(totalIncome);
                this.totalExpense.set(totalExpense);
              }
            });
          }
        })
      )
      .subscribe(() => {
        this.transactionloading = false;
        let transArr = [...this.transactions];
        //  reason of doing that is because the paginator for p-table unable to track the entries if we insert the transaction one by one
        // we have to assign the transactions one shot
        this.transactions = this.sortTransactionByDate(transArr);
        this.initiateDonutChart();

        this.skeletonLoading = false;
        this.initiateBarChart();
      });
  }

  ngOnDestroy(): void {
    if (this.categories$) this.categories$.unsubscribe();
    if (this.transactions$) this.transactions$.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      startDate: this.fb.control(this.startDate(), [
        Validators.required,
        Validators.pattern(/^\d{4}-\d{2}-\d{2}$/),
      ]),
      endDate: this.fb.control(this.endDate(), [
        Validators.required,
        Validators.pattern(/^\d{4}-\d{2}-\d{2}$/),
      ]),
      typeOfRecord: this.fb.control(this.typeOfRecord(), [Validators.required]),
    });
  }

  showDialog() {
    this.appDialog.nativeElement.showModal();
  }

  closeDialog() {
    this.appDialog.nativeElement.close();
  }

  getTransaction() {
    const startDate: string = this.dateForm.get('startDate')?.value;
    const endDate: string = this.dateForm.get('endDate')?.value;
    const typeOfRecord: string = this.dateForm.get('typeOfRecord')?.value;
    this.startDate.set(startDate);
    this.endDate.set(endDate);
    this.typeOfRecord.set(typeOfRecord);
    this.closeDialog();
    console.log(this.typeOfRecord());
    this.ngOnInit();
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
      width: '30%',
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

  initiateDonutChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color-text');

    this.donutData = {
      labels: this.categories,
      datasets: [
        {
          data: this.categoriesDonutData(),
          backgroundColor: this.categoriesColor,
          hoverBackgroundColor: this.categoriesColor,
          // backgroundColor: [
          //   documentStyle.getPropertyValue('--green-400'),
          //   documentStyle.getPropertyValue('--red-400'),
          //   // documentStyle.getPropertyValue('--purple-500'),
          //   // documentStyle.getPropertyValue('--yellow-500'),
          // ],
          // hoverBackgroundColor: [
          //   documentStyle.getPropertyValue('--green-300'),
          //   documentStyle.getPropertyValue('--red-300'),
          //   // documentStyle.getPropertyValue('--purple-400'),
          //   // documentStyle.getPropertyValue('--yellow-400'),
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
          // this.router.navigate([this.categoriesRoutes[index]]);
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
      labels: this.finalBarChartLabels,
      datasets: [
        {
          type: 'bar',
          label: 'Records of selected dates',
          backgroundColor: this.categoriesColor,
          // backgroundColor: [
          //   documentStyle.getPropertyValue('--green-300'),
          //   documentStyle.getPropertyValue('--red-300'),
          //   documentStyle.getPropertyValue('--blue-300'),
          // ],
          data: this.finalBarChartData,
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
