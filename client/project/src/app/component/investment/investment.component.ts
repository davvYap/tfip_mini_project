import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Stock } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css'],
})
export class InvestmentComponent implements OnInit {
  investmentForm!: FormGroup;
  stocks!: Stock[];
  filteredStocks!: Stock[];

  constructor(private fb: FormBuilder, private getSvc: GetService) {}

  ngOnInit() {
    this.investmentForm = this.createForm();
    this.stocks = this.getSvc.getStocks();
  }

  createForm(): FormGroup {
    let date: string = new Date().toISOString().split('T')[0];
    return this.fb.group({
      symbol: this.fb.control('', [Validators.required]),
      quantity: this.fb.control('', [Validators.required]),
      strikePrice: this.fb.control('', [Validators.required]),
      purchaseDate: this.fb.control(date, [Validators.required]),
      fees: this.fb.control('', [Validators.required]),
    });
  }

  filterStock(event: any) {
    let filtered: Stock[] = [];
    let query = event.query;
    for (let i = 0; i < this.stocks.length; i++) {
      let stock = this.stocks[i];
      if (stock.symbol.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(stock);
      }
    }

    this.filteredStocks = filtered;
  }
}
