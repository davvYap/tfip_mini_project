import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  faFolderOpen,
  faHandPointRight,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { Observable, Subscription } from 'rxjs';
import { RegularTransaction, Transaction } from 'src/app/models';
import { DeleteService } from 'src/app/service/delete.service';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { UpdateService } from 'src/app/service/update.service';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { BreakpointService } from 'src/app/service/breakpoint.service';

@Component({
  selector: 'app-regular-transactions',
  templateUrl: './regular-transactions.component.html',
  styleUrls: ['./regular-transactions.component.css'],
})
export class RegularTransactionsComponent implements OnInit {
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;

  emptyIcon = faFolderOpen;
  pointRightIcon = faHandPointRight;

  regularTransactions$!: Subscription;
  regularTransactions!: RegularTransaction[];

  dialogRef!: DynamicDialogRef;

  constructor(
    private themeSvc: ThemeService,
    private postSvc: PostService,
    private getSvc: GetService,
    private title: Title,
    private confirmationSvc: ConfirmationService,
    private deleteSvc: DeleteService,
    private messageSvc: MessageService,
    private updateSvc: UpdateService,
    private dialogSvc: DialogService,
    private breakpointSvc: BreakpointService
  ) {}

  ngOnInit(): void {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.title.setTitle(`${this.getSvc.applicationName} | Mortgage`);
    this.breadcrumbItems = [
      { label: 'Savings Dashboard', routerLink: '/savings' },
      { label: 'Regular Transactions', routerLink: '/regular-transactions' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.breakpointSvc.initBreakpointObserver();

    this.regularTransactions = [];
    this.regularTransactions$ = this.getSvc
      .getUserRegularTransactions(this.getSvc.userId)
      .subscribe((res) => {
        this.regularTransactions = res.sort((a, b) =>
          a.tran.transactionName.localeCompare(b.tran.transactionName)
        );
      });
  }

  clear(table: Table) {
    table.clear();
    const input1 = document.getElementById('input1') as HTMLInputElement;
    input1.value = '';
  }

  deleteSelectedTransaction(
    event: any,
    regTranId: string,
    regTranName: string
  ) {
    this.confirmationSvc.confirm({
      target: event.target,
      message: `Are you sure you want to remove regular transaction ${regTranName} ?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteSvc
          .deleteRegularTransaction(this.getSvc.userId, regTranId, regTranName)
          .then((res) => {
            this.messageSvc.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: res.message,
            });
            setTimeout(() => {
              this.ngOnInit();
            }, 200);
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

  getDate(dateStr: string) {
    const newDate = new Date(dateStr);
    const date = newDate.getDate();
    const month = new Date().getMonth() + 2;
    const year = new Date().getFullYear();

    if (month > 12) {
      return `${date}-${month - 12}-${year + 1}`;
    }

    return `${date}-${month}-${year}`;
  }

  getSeverity(type: string): string {
    return type === 'expense' ? 'danger' : 'success';
  }

  toggleAcitveState(active: boolean, regTranId: string) {
    this.updateSvc
      .toggleUserRegularTransaction(this.getSvc.userId, active, regTranId)
      .then((res) => {
        this.messageSvc.add({
          severity: 'info',
          summary: 'Info',
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
  }

  addTransaction() {
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
}
