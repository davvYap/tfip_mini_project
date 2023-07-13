import { OnDestroy, Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, map } from 'rxjs';
import { MortgagePortfolio, Transaction } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import {
  faFolderOpen,
  faHandPointRight,
} from '@fortawesome/free-solid-svg-icons';
import { Params, Router } from '@angular/router';
import { DeleteService } from 'src/app/service/delete.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-mortgage-dashboard',
  templateUrl: './mortgage-dashboard.component.html',
  styleUrls: ['./mortgage-dashboard.component.css'],
})
export class MortgageDashboardComponent implements OnInit, OnDestroy {
  showMortgageCards: boolean = false;
  mortgagePortfolios!: MortgagePortfolio[];
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;
  emptyIcon = faFolderOpen;
  pointRightIcon = faHandPointRight;
  mortgageRepaymentProgress: number = 20;
  mortgagePortfolio$!: Subscription;
  userTransactions!: Transaction[];
  userTransactions$!: Subscription;

  dialogRef!: DynamicDialogRef;

  constructor(
    private themeSvc: ThemeService,
    private getSvc: GetService,
    private dialogSvc: DialogService,
    private messageSvc: MessageService,
    private title: Title,
    private router: Router,
    private deleteSvc: DeleteService,
    private confirmationService: ConfirmationService,
    private decimalPipe: DecimalPipe
  ) {}

  ngOnInit(): void {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.title.setTitle(`${this.getSvc.applicationName} | Mortgage`);
    this.breadcrumbItems = [
      { label: 'Dashboard', routerLink: '/' },
      { label: 'Mortgage', routerLink: '/mortgage-dashboard' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };

    this.showMortgageCards = true;
    this.mortgagePortfolios = [];
    this.mortgagePortfolio$ = this.getSvc
      .getUserMortgagePortfolio(this.getSvc.userId)
      .pipe(
        map((res: MortgagePortfolio[]) => {
          for (let i = 0; i < res.length; i++) {
            res[i].imgString = this.getImgSrc(i);
          }

          return res;
        })
      )
      .subscribe((res) => {
        this.mortgagePortfolios = res;
      });

    this.userTransactions = [];
    this.userTransactions$ = this.getSvc
      .getUserAllTransaction(this.getSvc.userId)
      .subscribe((res) => {
        this.userTransactions = res;
      });
  }

  ngOnDestroy(): void {
    if (this.userTransactions$) this.userTransactions$.unsubscribe();
    if (this.mortgagePortfolio$) this.mortgagePortfolio$.unsubscribe();
  }

  getImgSrc(i: number): string {
    const rand = this.getImgSrcIndexRecursive(i + 1);
    return `/assets/images/house-${rand}.jpg`;
  }

  getImgSrcIndexRecursive(i: number): number {
    let j = i;
    while (j > 5) {
      j -= 5;
      this.getImgSrcIndexRecursive(j);
    }
    return j;
  }

  getMortgageRepaymentProgress(
    mortgageId: string,
    totalRepayment: number
  ): number {
    const transactions = this.userTransactions;
    let totalRepaymentPaid = 0;
    transactions.map((tran) => {
      if (tran.remarks.includes(mortgageId) && tran.type === 'expense') {
        totalRepaymentPaid += tran.amount;
      }
    });
    const progress: number = (totalRepaymentPaid / totalRepayment) * 100;
    const progressPercent = this.convertToPercentage(progress);
    return progressPercent;
  }

  convertToPercentage(numberValue: number): number {
    const percentageString: string | null = this.decimalPipe.transform(
      numberValue,
      '1.2-2'
    );
    if (percentageString !== null) {
      const percentage = parseFloat(percentageString);
      return percentage;
    }
    return numberValue;
  }

  toMortgageCalculator() {
    this.router.navigate(['/mortgage']);
  }

  navigateTo(i: number) {
    const qp: Params = {
      mortgageId: this.mortgagePortfolios[i].id,
    };
    this.router.navigate(['/mortgage'], { queryParams: qp });
  }

  addToTransaction(index: number) {
    const mortgageTrans: Transaction = {
      transactionId: '',
      transactionName: 'Mortgage monthly repayment',
      type: 'expense',
      date: '',
      amount: this.mortgagePortfolios[index].monthlyRepayment,
      remarks: this.mortgagePortfolios[index].id,
      categoryName: '',
      categoryId: '',
      dateNum: 0,
    };

    this.dialogRef = this.dialogSvc.open(AddTransactionComponent, {
      header: 'New Mortgage Repayment',
      width: '30%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
      data: { mortgageMonthlyPayment: mortgageTrans },
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

  confirmRemoveMortgage(i: number) {
    const selectedMort = this.mortgagePortfolios[i];
    this.confirmationService.confirm({
      message: `Are you sure that you want to delete mortgage (${selectedMort.id}) and relavant transactions from portfolio?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.removeMortgage(i);
      },
      reject: () => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'Cancel delete',
        });
      },
    });
  }

  removeMortgage(i: number) {
    const mortgageId = this.mortgagePortfolios[i].id;
    this.deleteSvc
      .deleteMortgagePortfolio(this.getSvc.userId, mortgageId)
      .then((msg) => {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Successful',
          detail: msg.message,
        });
        this.ngOnInit();
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      });
  }
}
