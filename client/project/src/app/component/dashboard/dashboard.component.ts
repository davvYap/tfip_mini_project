import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  donutData!: any;
  donutOptions!: any;

  lineData!: any;
  lineOptions!: any;
  guideLineDataForSP500!: number[];
  portfolioPerformanceData!: number[];

  savingsValue!: number;
  stocksValue!: number;
  cryptoValue!: number;
  investmentsValue!: number;
  propertiesValue!: number;
  miscValue!: number;
  totalValue!: number;

  ngOnInit(): void {
    Chart.defaults.color = '#fff';
    Chart.defaults.font.size = 14;
    Chart.defaults.font.weight = '300';
    Chart.defaults.borderColor = '#fff';
    // this.stocksValue = 8000;
    // this.cryptoValue = 1200;
    this.savingsValue = 8500;
    this.investmentsValue = 6900 + 8000 + 1200;
    this.propertiesValue = 57500;
    this.miscValue = 1200;
    this.totalValue =
      this.savingsValue +
      this.investmentsValue +
      this.propertiesValue +
      this.miscValue;
    this.guideLineDataForSP500 = [65, 59, 80, 81, 56, 55, 10];
    this.portfolioPerformanceData = [28, 48, 40, 19, 86, 27, 30];

    this.initiateDonutChart();

    this.initiateLineChart();
  }

  initiateDonutChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.donutData = {
      labels: ['Savings', 'Investments', 'Property', 'Misc.'],
      datasets: [
        {
          data: [
            // this.stocksValue,
            // this.cryptoValue,
            this.savingsValue,
            this.investmentsValue,
            this.propertiesValue,
            this.miscValue,
          ],
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--purple-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--purple-400'),
          ],
        },
      ],
    };

    this.donutOptions = {
      cutout: '60%',
      hoverOffset: 10,
      plugins: {
        legend: {
          labels: {
            // color: textColor,
            color: '#fff',
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
        },
      },
    };
  }

  initiateLineChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.lineData = {
      labels: [
        'January',
        'February',
        'March',
        'April',
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
          label: 'S&P 500',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          yAxisID: 'y',
          tension: 0.4,
          data: this.guideLineDataForSP500,
        },
        {
          label: 'Portfolio',
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-500'),
          yAxisID: 'y1',
          tension: 0.4,
          data: this.portfolioPerformanceData,
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
            // color: textColor,
            color: '#fff',
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
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            drawOnChartArea: false,
            color: surfaceBorder,
          },
        },
      },
    };
  }
}
