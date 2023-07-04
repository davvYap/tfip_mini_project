import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Chart } from 'chart.js';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  switchTheme$ = new Subject<boolean>();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  switchTheme(theme: string) {
    let themeLink = this.document.getElementById(
      'app-theme'
    ) as HTMLLinkElement;

    if (themeLink) {
      themeLink.href = theme + '.css';
    }
  }

  initiateChartSetting() {
    const documentStyle = getComputedStyle(document.documentElement);
    Chart.defaults.color = documentStyle.getPropertyValue('--text-color');
    Chart.defaults.font.size = 14;
    Chart.defaults.font.weight = '300';
    Chart.defaults.borderColor = '#fff';
  }
}
