import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { SseService } from 'src/app/service/sse.service';
import { ThemeService } from 'src/app/service/theme.service';

@Component({
  selector: 'app-real-time-price',
  templateUrl: './real-time-price.component.html',
  styleUrls: ['./real-time-price.component.css'],
})
export class RealTimePriceComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  stockPrice$!: Subscription;
  stockPrice = signal(0.0);
  count = 0;
  symbol!: string;

  constructor(
    private sseSvc: SseService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private themeSvc: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.form = this.createForm();
  }

  ngOnDestroy(): void {
    if (this.stockPrice$) this.stockPrice$.unsubscribe();
    this.sseSvc.closeConnection();
  }

  createForm(): FormGroup {
    return this.fb.group({
      symbol: this.fb.control('', Validators.required),
    });
  }

  getPrice(): void {
    const symbol = this.form.get('symbol')?.value;
    this.symbol = symbol;
    this.sseSvc.closeConnection();
    console.log('symbol :', symbol);
    this.stockPrice$ = this.sseSvc.getStockRealTimePrice(symbol).subscribe({
      next: (data: string) => {
        console.log('data passed from sse service: ', data);
        this.stockPrice.set(parseFloat(data));
        console.log('component price: ', this.stockPrice());
        this.count++;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }

  stopSse() {
    this.sseSvc.closeConnection();
  }
}
