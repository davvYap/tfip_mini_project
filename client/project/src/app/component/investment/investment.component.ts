import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PurchasedStock, Stock } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css'],
})
export class InvestmentComponent implements OnInit, OnDestroy {
  investmentForm!: FormGroup;
  stocks!: Stock[];
  filteredStocksSymbol!: String[];
  maxDate!: Date;
  stocksData$!: Subscription;
  stockSymbolTrimmed!: string;
  stockNameTrimmed!: string;

  constructor(
    private fb: FormBuilder,
    private getSvc: GetService,
    private postSvc: PostService
  ) {}

  ngOnInit() {
    this.investmentForm = this.createForm();
    let today = new Date();
    let tmr = new Date();
    tmr.setDate(today.getDate() + 1);
    this.maxDate = tmr;
  }

  ngOnDestroy(): void {
    if (this.stocksData$) this.stocksData$.unsubscribe();
  }

  createForm(): FormGroup {
    // let date: string = new Date().toISOString().split('T')[0];
    return this.fb.group({
      symbol: this.fb.control('', [Validators.required]),
      quantity: this.fb.control('', [Validators.required]),
      price: this.fb.control('', [Validators.required]),
      date: this.fb.control('', [Validators.required]),
      fees: this.fb.control(0.0),
    });
  }

  filterStock(event: any) {
    let filtered: String[] = [];
    let query = event.query;

    this.stocksData$ = this.getSvc.getStocks(query).subscribe((res) => {
      this.stocks = res.data;
      for (let i = 0; i < this.stocks.length; i++) {
        let stock = this.stocks[i];
        if (stock.symbol.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          let queryStock = `${stock.symbol} | ${stock.instrument_name} (${stock.exchange})`;
          filtered.push(queryStock);
        }
      }
      this.filteredStocksSymbol = filtered;
    });
  }

  onSelectStock(event: any) {
    console.log('event >>> ', event);
    let stockSymbol: string = event;

    const index: number = stockSymbol.indexOf(' | ');
    const lastIndex: number = stockSymbol.lastIndexOf(' (');
    this.stockSymbolTrimmed = stockSymbol.substring(0, index);
    this.stockNameTrimmed = stockSymbol.substring(index + 3, lastIndex);
    // console.log('stockselected >>> ', this.stockNameTrimmed);
    let stockPrice: number = 0;

    this.getSvc.getStockPrice(this.stockSymbolTrimmed).then((res) => {
      stockPrice = Number(res.price);
      this.investmentForm.controls['price'].setValue(stockPrice);
    });
  }

  addStock() {
    let stockPurchased = this.investmentForm.value as PurchasedStock;
    stockPurchased.symbol = this.stockSymbolTrimmed;
    stockPurchased.name = this.stockNameTrimmed;

    let timeLong = this.investmentForm.get('date')?.value.getTime();
    stockPurchased.date = timeLong;
    console.log('Stock >>> ', stockPurchased);

    let userId: string = this.getSvc.userId;
    this.postSvc
      .addStock(userId, stockPurchased)
      .then((res) => {
        alert(res.message);
      })
      .catch((err) => {
        alert(err.message);
      });
    this.clearForm();
  }

  clearForm() {
    this.investmentForm = this.createForm();
  }
}
