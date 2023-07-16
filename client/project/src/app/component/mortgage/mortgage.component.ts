import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeTable } from 'primeng/treetable';
import {
  Column,
  ExportColumn,
  MortgageAmortizationTable,
  MortgageLoan,
  MortgagePortfolio,
  Transaction,
} from 'src/app/models';
import { ExportService } from 'src/app/service/export.service';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { AddMortgageComponent } from '../add-mortgage/add-mortgage.component';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

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

  lineData!: any;
  lineOptions!: any;
  mortgageLabels!: number[];
  principalLineData!: number[];
  interestLineData!: number[];
  monthlyPaymentLineData!: number[];
  showAmortizationChart: boolean = false;

  showAmortizationTable: boolean = false;
  mortgageData!: MortgageAmortizationTable[];
  mortgageRepaymentData!: TreeNode[];
  expandTreeTable: boolean = false;
  showSkeleton: boolean = false;
  mortgageTreeTableCols!: Column[];
  mortgageTreeTableExportCols!: ExportColumn[];
  mortgageExportBtnItems!: MenuItem[];

  dialogRef!: DynamicDialogRef;

  userMortgagePortfolios!: MortgagePortfolio[];
  selectedMortgageId!: string;
  showUpdateButton: boolean = false;

  months: string[] = [
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

  @ViewChild('mortgagett') treeTable!: TreeTable;

  constructor(
    private themeSvc: ThemeService,
    private title: Title,
    private getSvc: GetService,
    private exportSvc: ExportService,
    private dialogSvc: DialogService,
    private messageSvc: MessageService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.breadcrumbItems = [
      { label: 'Dashboard', routerLink: '/' },
      { label: 'Mortgage', routerLink: '/mortgage-dashboard' },
      { label: 'Calculator', routerLink: '/mortgage' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.title.setTitle(`${this.getSvc.applicationName} | Calculator`);
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.themeSvc.switchTheme$.subscribe((res) => {
      if (res) {
        setTimeout(() => {
          this.initiateDonutChart();
          this.initiateLineChart();
        }, 200);
      }
    });

    this.repaymentCategories = ['Principal', 'Interest'];
    // this.getSvc
    //   .getMortgageLoanData(
    //     this.loanAmount,
    //     this.loanTerm,
    //     this.interestRate / 100,
    //     this.typeOfLoanTerm
    //   )
    //   .then((data: MortgageLoan) => {
    //     this.repaymentAmountData.set([data.principal, data.totalInterest]);
    //     this.monthlyRepayment.set(data.monthlyRepayment);
    //   })
    //   .then(() => {
    //     this.initiateDonutChart();
    //   });

    // USER MORTGAGE PORTFOLIO
    console.log(this.activatedRoute.snapshot.queryParams['mortgageId']);
    if (this.activatedRoute.snapshot.queryParams['mortgageId']) {
      this.selectedMortgageId =
        this.activatedRoute.snapshot.queryParams['mortgageId'];
      this.showUpdateButton = true;
    } else {
      this.calculate();
    }
    this.userMortgagePortfolios = [];
    this.getSvc
      .getUserMortgagePortfolio(this.getSvc.userId)
      .pipe(
        map((res) => {
          res.map((mort) => {
            if (mort.id === this.selectedMortgageId) {
              this.loanTerm = mort.totalPeriod;
              this.loanAmount = mort.loanAmount;
              this.interestRate = mort.interest;
              this.typeOfLoanTerm = 'month';
              setTimeout(() => {
                this.calculate();
                this.getAmortizationTable();
              }, 500);
            }
          });
          return res;
        })
      )
      .subscribe((res) => {
        this.userMortgagePortfolios = res;
      });

    // EXPORT SVC
    this.mortgageTreeTableCols = [
      {
        header: 'Date',
        field: 'year',
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
        field: 'repayment',
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
    this.mortgageTreeTableExportCols = this.mortgageTreeTableCols.map(
      (col) => ({
        title: col.header,
        dataKey: col.field,
      })
    );
    this.mortgageExportBtnItems = [
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.exportExcelMortgageTable(),
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
        if (this.showAmortizationTable) {
          this.getAmortizationTable();
        }
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
    this.showAmortizationTable = false;
    this.showSkeleton = true;
    this.mortgageRepaymentData = [];
    this.principalLineData = [];
    this.interestLineData = [];
    this.monthlyPaymentLineData = [];
    this.mortgageLabels = [];

    this.getSvc
      .getMortgageAmortizationTable(
        this.loanAmount,
        this.loanTerm,
        interest,
        this.typeOfLoanTerm
      )
      .then((res: MortgageAmortizationTable[]) => {
        // FOR EXPORT PDF
        this.mortgageData = res;

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

        for (let j = startingMonth; j < totalMonths; j++) {
          // NOTE check if the the curr month is December
          if ((j + 1) % 12 === 0) {
            totalPrincipalPerYear += res[j].principal;
            totalInterestPerYear += res[j].interest;
            totalPaymentPerYear += res[j].repayment;
            accTotalInterestPaid = res[j].totalInterestPaid;
            accPrincipalBalanceRemainingPerYear = res[j].balanceRemaining;

            // FOR LINECHART DATA
            this.mortgageLabels.push(currYear);
            this.principalLineData.push(totalPrincipalPerYear / 12);
            this.interestLineData.push(totalInterestPerYear / 12);
            this.monthlyPaymentLineData.push(totalPaymentPerYear / 12);

            // FOR TREE TABLE
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

            let monthIndex = 0;
            res.map((m) => {
              if (m.year === currYear) {
                let mortgageDataEachMonth: TreeNode<any> = {
                  data: {
                    date: `${this.months[monthIndex]} ${m.year}`,
                    principal: m.principal,
                    interest: m.interest,
                    payment: m.repayment,
                    totalInterestPaid: m.totalInterestPaid,
                    balanceRemaining: m.balanceRemaining,
                  },
                };
                mortgageDataEachYear.children?.push(mortgageDataEachMonth);
                monthIndex++;
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

        // FOR REMAINING MONTHS
        totalPrincipalPerYear = 0;
        totalInterestPerYear = 0;
        totalPaymentPerYear = 0;
        // console.log('total months > ', totalMonths);
        const remainingMonths = totalMonths % 12;
        // console.log('remaining month > ', remainingMonths);
        // console.log('resuslt', res);
        if (remainingMonths !== 0) {
          for (let i = totalMonths - remainingMonths; i < totalMonths; i++) {
            if (i === totalMonths - 1) {
              console.log('i', i);

              totalPrincipalPerYear += res[i].principal;
              totalInterestPerYear += res[i].interest;
              totalPaymentPerYear += res[i].repayment;
              accTotalInterestPaid = res[i].totalInterestPaid;
              accPrincipalBalanceRemainingPerYear = res[i].balanceRemaining;

              // FOR LINECHART DATA
              this.mortgageLabels.push(currYear);
              this.principalLineData.push(
                totalPrincipalPerYear / remainingMonths
              );

              this.interestLineData.push(
                totalInterestPerYear / remainingMonths
              );

              this.monthlyPaymentLineData.push(
                totalPaymentPerYear / remainingMonths
              );

              // FOR TREE TABLE
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

              let monthIndex = 0;
              res.map((m) => {
                if (m.year === currYear) {
                  let mortgageDataEachMonth: TreeNode<any> = {
                    data: {
                      date: `${this.months[monthIndex]} ${m.year}`,
                      principal: m.principal,
                      interest: m.interest,
                      payment: m.repayment,
                      totalInterestPaid: m.totalInterestPaid,
                      balanceRemaining: m.balanceRemaining,
                    },
                  };
                  mortgageDataEachYear.children?.push(mortgageDataEachMonth);
                  monthIndex++;
                }
              });

              this.mortgageRepaymentData.push(mortgageDataEachYear);
            } else {
              console.log('i', i);
              totalPrincipalPerYear += res[i]?.principal;
              totalInterestPerYear += res[i]?.interest;
              totalPaymentPerYear += res[i]?.repayment;
            }
          }
        }
      });
    // console.log(this.mortgageRepaymentData);
    setTimeout(() => {
      this.showSkeleton = false;
      this.showAmortizationTable = true;
      this.showAmortizationChart = true;
      this.initiateLineChart();
    }, 200);
  }

  expandRecursive(nodes: any[]) {
    for (const node of nodes) {
      node.expanded = true;

      if (node.children) {
        this.expandRecursive(node.children);
      }
    }
  }

  toggleExpandRecursive(nodes: any[], expand: boolean) {
    for (const node of nodes) {
      node.expanded = expand;

      if (node.children) {
        this.expandRecursive(node.children);
      }
    }
  }

  toggleExpandTreeTable() {
    this.expandTreeTable === true ? false : true;
    this.showAmortizationTable = false;
    this.showSkeleton = true;
    this.toggleExpandRecursive(this.treeTable.value, this.expandTreeTable);
    setTimeout(() => {
      this.showAmortizationTable = true;
      this.showSkeleton = false;
    }, 200);
  }

  isNumber(date: number | string): boolean {
    if (typeof date === 'number' && this.expandTreeTable) return true;
    return false;
  }

  exportExcelMortgageTable() {
    this.exportSvc.exportExcel(
      'mortgagett',
      `mortgage_amortization_table_${this.getSvc.userId}`
    );
  }

  exportPdfMortgageTable() {
    this.exportSvc.exportPdf(
      this.mortgageTreeTableExportCols,
      this.mortgageData,
      `mortgage_amortization_table_${this.getSvc.userId}`
    );
  }

  initiateLineChart() {
    // const documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle().getPropertyValue(
      '--primary-color-text'
    );
    const textColorSecondary = this.documentStyle().getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder =
      this.documentStyle().getPropertyValue('--surface-border');

    this.lineData = {
      labels: this.mortgageLabels, // years
      datasets: [
        {
          label: 'Princial',
          fill: 'origin',
          borderColor: this.documentStyle().getPropertyValue('--blue-500'),
          // yAxisID: 'y',
          tension: 0.4,
          // data: this.principalLineData,
        },
        {
          label: 'Interest',
          fill: {
            target: 'origin',
            above: 'rgb(0, 128, 128, 0.5)',
          },
          borderColor: this.documentStyle().getPropertyValue('--teal-500'),
          // yAxisID: 'y1',
          tension: 0.4,
          data: this.interestLineData,
        },
        {
          label: 'Monthly Payment',
          fill: {
            target: 'origin',
            above: 'rgba(53, 162, 235, 0.4)',
          },
          borderColor: this.documentStyle().getPropertyValue('--primary-color'),
          // yAxisID: 'y1',
          tension: 0.4,
          data: this.monthlyPaymentLineData,
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
            color: textColorSecondary,
            // color: '#000000 ',
          },
          onClick: () => {},
        },
        customCanvasBackgroundColor: {
          color: this.documentStyle().getPropertyValue('--surface-ground'),
        },
        title: {
          display: true,
          text: 'Average Monthly Payment Breakdown',
          color: textColorSecondary,
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            footer: (tooltipItem: any, data: any) => {
              // console.log(tooltipItem);
              const principal: number = tooltipItem[1].raw - tooltipItem[0].raw;
              const principalStr: string = principal.toString().substring(0, 8);
              return `Principal: ${principalStr}`;
            },
          },
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

  addToPortfolio() {
    let totalMonths: number = this.loanTerm;
    if (this.typeOfLoanTerm === 'year') {
      totalMonths *= 12;
    }
    const mortPortfolio: MortgagePortfolio = {
      id: '#',
      loanAmount: this.loanAmount,
      monthlyRepayment: this.monthlyRepayment(),
      totalPeriod: totalMonths,
      interest: this.interestRate,
      totalRepayment:
        this.repaymentAmountData()[0] + this.repaymentAmountData()[1],

      imgString: '',
      new: true,
    };

    this.dialogRef = this.dialogSvc.open(AddMortgageComponent, {
      header: 'New mortgage portfolio',
      width: '30%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
      data: { mortgagePortfolio: mortPortfolio },
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

  updateMortgagePortfolio() {
    let totalMonths: number = this.loanTerm;
    if (this.typeOfLoanTerm === 'year') {
      totalMonths *= 12;
    }
    const mortPortfolio: MortgagePortfolio = {
      id: this.selectedMortgageId,
      loanAmount: this.loanAmount,
      monthlyRepayment: this.monthlyRepayment(),
      totalPeriod: totalMonths,
      interest: this.interestRate,
      totalRepayment:
        this.repaymentAmountData()[0] + this.repaymentAmountData()[1],

      imgString: '',
      new: false,
    };

    this.dialogRef = this.dialogSvc.open(AddMortgageComponent, {
      header: 'Update mortgage portfolio',
      width: '30%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
      data: { mortgagePortfolio: mortPortfolio },
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
