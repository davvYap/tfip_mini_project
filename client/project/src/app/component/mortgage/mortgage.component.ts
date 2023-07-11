import { Component, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MenuItem, TreeNode } from 'primeng/api';
import {
  Column,
  MortgageAmortizationTable,
  MortgageLoan,
} from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';

@Component({
  selector: 'app-mortgage',
  templateUrl: './mortgage.component.html',
  styleUrls: ['./mortgage.component.css'],
})
export class MortgageComponent implements OnInit {
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;
  documentStyle = signal(getComputedStyle(document.documentElement));
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

  loanAmount: number = 515_000;
  loanTerm: number = 30;
  interestRate: number = 4;

  types: any = [
    { label: 'Year', value: 'year' },
    { label: 'Month', value: 'month' },
  ];
  typeOfLoanTerm: string = 'year';
  minLoanTerm: number = 1;
  maxLoanTerm: number = 35;

  donutData!: any;
  donutOptions!: any;
  repaymentCategories!: string[];
  repaymentAmountData = signal<number[]>([]);
  monthlyRepayment = signal<number>(0);

  showAmortizationTable: boolean = false;
  mortgageRepaymentData!: TreeNode[];
  mortgageTreeTableCols!: Column[];

  constructor(
    private themeSvc: ThemeService,
    private title: Title,
    private getSvc: GetService
  ) {}

  ngOnInit(): void {
    this.breadcrumbItems = [
      { label: 'Dashboard', routerLink: '/' },
      { label: 'Mortgage', routerLink: '/mortgage' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.title.setTitle(`${this.getSvc.applicationName} | Mortgage`);
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.themeSvc.switchTheme$.subscribe((res) => {
      if (res) {
        setTimeout(() => {
          this.initiateDonutChart();
        }, 200);
      }
    });

    this.repaymentCategories = ['Principal', 'Interest'];
    this.getSvc
      .getMortgageLoanData(
        this.loanAmount,
        this.loanTerm,
        this.interestRate / 100,
        this.typeOfLoanTerm
      )
      .then((data: MortgageLoan) => {
        this.repaymentAmountData.set([data.principal, data.totalInterest]);
        this.monthlyRepayment.set(data.monthlyRepayment);
      })
      .then(() => {
        this.initiateDonutChart();
      });

    this.mortgageTreeTableCols = [
      {
        header: 'Date',
        field: 'date',
      },
      {
        header: 'Principal',
        field: 'principal',
      },

      {
        header: 'Interest',
        field: 'interest',
      },

      {
        header: 'Payment',
        field: 'payment',
      },
      {
        header: 'Total Interest Paid',
        field: 'totalInterestPaid',
      },
      {
        header: 'Total Remaining Balance',
        field: 'balanceRemaining',
      },
    ];
  }

  onChangeTypeOfTerm() {
    if (this.typeOfLoanTerm === 'month') {
      this.maxLoanTerm = 420;
    } else {
      this.maxLoanTerm = 35;
    }
    this.calculate();
  }

  calculate() {
    const interest = this.interestRate / 100;
    // console.log(this.loanAmount, this.loanTerm, interest);
    this.getSvc
      .getMortgageLoanData(
        this.loanAmount,
        this.loanTerm,
        interest,
        this.typeOfLoanTerm
      )
      .then((data: MortgageLoan) => {
        this.repaymentAmountData.set([data.principal, data.totalInterest]);
        this.monthlyRepayment.set(data.monthlyRepayment);
      })
      .then(() => {
        this.initiateDonutChart();
      });
  }

  initiateDonutChart() {
    const textColor = this.documentStyle().getPropertyValue('--text-color');

    this.donutData = {
      labels: this.repaymentCategories,
      datasets: [
        {
          data: this.repaymentAmountData(),
          backgroundColor: [
            this.documentStyle().getPropertyValue('--teal-400'),
            this.documentStyle().getPropertyValue('--blue-400'),
          ],
          hoverBackgroundColor: [
            this.documentStyle().getPropertyValue('--teal-300'),
            this.documentStyle().getPropertyValue('--blue-300'),
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

            padding: 10,
          },
        },
        title: {
          display: true,
          text: 'Total Repayment',
          position: 'bottom',
          padding: {
            top: 20,
            bottom: 0,
          },

          color: textColor,
        },
      },
    };
  }

  getAmortizationTable() {
    const interest = this.interestRate / 100;
    this.mortgageRepaymentData = [];
    this.getSvc
      .getMortgageAmortizationTable(
        this.loanAmount,
        this.loanTerm,
        interest,
        this.typeOfLoanTerm
      )
      .then((res: MortgageAmortizationTable[]) => {
        this.showAmortizationTable = true;
        let currYear: number = new Date().getFullYear();
        let startingMonth = 0;
        let totalMonths: number = this.loanTerm;
        if (this.typeOfLoanTerm === 'year') {
          totalMonths *= 12;
        }

        let totalPrincipalPerYear = 0;
        let totalInterestPerYear = 0;
        let totalPaymentPerYear = 0;
        let accTotalInterestPaid = 0;
        let accPrincipalBalanceRemainingPerYear = this.loanAmount;
        for (let j = startingMonth; j <= totalMonths; j++) {
          if ((j + 1) % 12 === 0) {
            totalPrincipalPerYear += res[j].principal;
            totalInterestPerYear += res[j].interest;
            totalPaymentPerYear += res[j].repayment;
            accTotalInterestPaid = res[j].totalInterestPaid;
            accPrincipalBalanceRemainingPerYear = res[j].balanceRemaining;

            let mortgageDataEachYear: TreeNode<any> = {
              data: {
                date: currYear,
                principal: totalPrincipalPerYear,
                interest: totalInterestPerYear,
                payment: totalPaymentPerYear,
                totalInterestPaid: accTotalInterestPaid,
                balanceRemaining: accPrincipalBalanceRemainingPerYear,
              },
              children: [],
            };

            res.map((m) => {
              if (m.year === currYear) {
                let mortgageDataEachMonth: TreeNode<any> = {
                  data: {
                    date: m.year,
                    principal: m.principal,
                    interest: m.interest,
                    payment: m.repayment,
                    totalInterestPaid: m.totalInterestPaid,
                    balanceRemaining: m.balanceRemaining,
                  },
                };
                mortgageDataEachYear.children?.push(mortgageDataEachMonth);
              }
            });

            this.mortgageRepaymentData.push(mortgageDataEachYear);
            totalPrincipalPerYear = 0;
            totalInterestPerYear = 0;
            totalPaymentPerYear = 0;
            startingMonth += 12;
            currYear += 1;
          } else {
            totalPrincipalPerYear += res[j].principal;
            totalInterestPerYear += res[j].interest;
            totalPaymentPerYear += res[j].repayment;
          }
        }
      });
  }

  exportExcelTransaction() {}

  exportPdfTransaction() {}
}
