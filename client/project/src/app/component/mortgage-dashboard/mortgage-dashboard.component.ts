import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map } from 'rxjs';
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

@Component({
  selector: 'app-mortgage-dashboard',
  templateUrl: './mortgage-dashboard.component.html',
  styleUrls: ['./mortgage-dashboard.component.css'],
})
export class MortgageDashboardComponent implements OnInit {
  showMortgageCards: boolean = false;
  mortgagePortfolios!: MortgagePortfolio[];
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;
  emptyIcon = faFolderOpen;
  pointRightIcon = faHandPointRight;

  dialogRef!: DynamicDialogRef;

  constructor(
    private themeSvc: ThemeService,
    private getSvc: GetService,
    private dialogSvc: DialogService,
    private messageSvc: MessageService,
    private title: Title,
    private router: Router,
    private deleteSvc: DeleteService,
    private confirmationService: ConfirmationService
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
    this.getSvc
      .getUserMortgagePortfolio(this.getSvc.userId)
      .pipe(
        map((res: MortgagePortfolio[]) => {
          res.map((m) => {
            m.imgString = this.getImgSrc();
          });
          return res;
        })
      )
      .subscribe((res) => {
        this.mortgagePortfolios = res;
      });
  }

  getImgSrc(): string {
    const rand = this.getRandomNumber();
    return `/assets/images/house-${rand}.jpg`;
  }

  getRandomNumber(): number {
    const randomDecimal = Math.random();
    const randomNumber = Math.floor(randomDecimal * 5) + 1;
    return randomNumber;
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
      categoryName: 'Mortgage',
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
    console.log('confriming delete');
    this.confirmationService.confirm({
      message:
        'Are you sure that you want to delete this mortgage from portfolio?',
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
