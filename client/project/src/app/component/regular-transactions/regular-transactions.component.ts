import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { RegularTransaction, Transaction } from 'src/app/models';
import { DeleteService } from 'src/app/service/delete.service';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';

@Component({
  selector: 'app-regular-transactions',
  templateUrl: './regular-transactions.component.html',
  styleUrls: ['./regular-transactions.component.css'],
})
export class RegularTransactionsComponent implements OnInit {
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;

  regularTransactions!: RegularTransaction[];
  loading!: boolean;
  constructor(
    private themeSvc: ThemeService,
    private postSvc: PostService,
    private getSvc: GetService,
    private title: Title,
    private confirmationSvc: ConfirmationService,
    private deleteSvc: DeleteService,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.title.setTitle(`${this.getSvc.applicationName} | Mortgage`);
    this.breadcrumbItems = [
      { label: 'Dashboard', routerLink: '/' },
      { label: 'Savings Dashboard', routerLink: '/savings' },
      { label: 'Regular Transactions', routerLink: '/regular-transactions' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };

    this.loading = false;
  }

  clear(table: Table) {
    table.clear();
    const input1 = document.getElementById('input1') as HTMLInputElement;
    input1.value = '';
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
}
