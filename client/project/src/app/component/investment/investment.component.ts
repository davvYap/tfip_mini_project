import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { PurchasedStock, Stock } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { v4 as uuidv4 } from 'uuid';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css'],
})
export class InvestmentComponent implements OnInit, OnDestroy {
  breadcrumbItems: MenuItem[] | undefined;
  breadcrumbHome: MenuItem | undefined;
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
    private postSvc: PostService,
    private messageSvc: MessageService,
    private themeSvc: ThemeService,
    private title: Title
  ) {}

  ngOnInit() {
    this.breadcrumbItems = [
      { label: 'Dashboard', routerLink: '/' },
      { label: 'Portfolio', routerLink: '/investment-dashboard' },
      { label: 'New Stock', routerLink: '/investment' },
    ];
    this.breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };
    this.title.setTitle(`${this.getSvc.applicationName} | +Stock`);
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
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
    let id: string = uuidv4().substring(0, 8);
    let stockPurchased = this.investmentForm.value as PurchasedStock;
    stockPurchased.purchaseId = id;
    stockPurchased.symbol = this.stockSymbolTrimmed;
    stockPurchased.name = this.stockNameTrimmed;

    let timeLong: number = this.investmentForm.get('date')?.value?.getTime();
    console.log('timeLong', timeLong);
    stockPurchased.date = timeLong;
    console.log('Stock >>> ', stockPurchased);

    let userId: string = this.getSvc.userId;
    this.postSvc
      .addStock(userId, stockPurchased)
      .then((res) => {
        this.showAddStockSuccessfullyMessage(res.message);
      })
      .catch((err) => {
        this.showErrorMessage(err.message);
      });
    this.clearForm();
  }

  clearForm() {
    this.investmentForm = this.createForm();
  }

  showAddStockSuccessfullyMessage(message: string) {
    this.messageSvc.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  showErrorMessage(message: string) {
    this.messageSvc.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
}
