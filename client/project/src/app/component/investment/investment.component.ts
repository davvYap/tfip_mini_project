import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchasedStock, Stock } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css'],
})
export class InvestmentComponent implements OnInit {
  investmentForm!: FormGroup;
  stocks!: Stock[];
  filteredStocksSymbol!: String[];
  maxDate!: Date;

  constructor(
    private fb: FormBuilder,
    private getSvc: GetService,
    private postSvc: PostService
  ) {}

  ngOnInit() {
    this.investmentForm = this.createForm();
    this.stocks = this.getSvc.getStocks();
    let today = new Date();
    let tmr = new Date();
    tmr.setDate(today.getDate() + 1);
    this.maxDate = tmr;
  }

  createForm(): FormGroup {
    let date: string = new Date().toISOString().split('T')[0];
    return this.fb.group({
      symbol: this.fb.control('', [Validators.required]),
      quantity: this.fb.control('', [Validators.required]),
      price: this.fb.control('', [Validators.required]),
      date: this.fb.control(date, [Validators.required]),
      fees: this.fb.control('', [Validators.required]),
    });
  }

  filterStock(event: any) {
    let filtered: String[] = [];
    let query = event.query;
    for (let i = 0; i < this.stocks.length; i++) {
      let stock = this.stocks[i];
      if (stock.symbol.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(stock.symbol);
      }
    }

    this.filteredStocksSymbol = filtered;
  }

  addStock() {
    let stockPurchased = this.investmentForm.value as PurchasedStock;
    let stockName = '';
    for (let i = 0; i < this.stocks.length; i++) {
      let stock = this.stocks[i];
      if (stock.symbol.toLowerCase() == stockPurchased.symbol.toLowerCase()) {
        stockName = stock.name;
      }
    }
    stockPurchased.name = stockName;
    let date: Date = this.investmentForm.get('date')?.value;
    let day: string = date.getDate().toString();
    let month: string = (date.getUTCMonth() + 1).toString();
    let year: string = date.getFullYear().toString();
    let dayMonthYear: string = day + '-' + month + '-' + year;
    stockPurchased.date = dayMonthYear;

    let quantity: string = this.investmentForm
      .get('quantity')
      ?.value.toString();
    let price: string = this.investmentForm.get('price')?.value.toString();
    let fees: string = this.investmentForm.get('fees')?.value.toString();

    stockPurchased.quantity = quantity;
    stockPurchased.price = price;
    stockPurchased.fees = fees;

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
  }

  clearForm() {
    this.investmentForm.reset();
  }
}
