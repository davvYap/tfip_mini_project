import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { PurchasedStock } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { UpdateService } from 'src/app/service/update.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-sell-stock',
  templateUrl: './sell-stock.component.html',
  styleUrls: ['./sell-stock.component.css'],
})
export class SellStockComponent implements OnInit {
  form!: FormGroup;
  maxDate!: Date;
  disable: boolean = true;
  stock!: PurchasedStock;

  constructor(
    private fb: FormBuilder,
    private getSvc: GetService,
    private updateSvc: UpdateService,
    private messageSvc: MessageService,
    public dialogRef: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.stock = this.getSvc.passStock;
    console.log('this stock', this.stock);
    let today = new Date();
    let tmr = new Date();
    tmr.setDate(today.getDate() + 1);
    this.maxDate = tmr;
    this.form = this.createForm(this.stock);
  }

  createForm(stock: PurchasedStock | null): FormGroup {
    // prefix today's date
    let date: string = new Date().toISOString().split('T')[0];
    return this.fb.group({
      symbol: this.fb.control(!!stock ? stock.symbol : '', Validators.required),
      name: this.fb.control(!!stock ? stock.name : '', Validators.required),
      date: this.fb.control(date, Validators.required),
      quantity: this.fb.control(
        !!stock ? stock.quantity : '',
        Validators.required
      ),
      price: this.fb.control(
        !!stock ? stock.marketPrice : '',
        Validators.required
      ),
      fees: this.fb.control(0.0, Validators.required),
    });
  }

  sellStock() {
    let userId: string = this.getSvc.userId;
    const soldStock: PurchasedStock = this.form.value as PurchasedStock;
    let timeLong: number = this.form.get('date')?.value?.getTime();
    if (this.stock.purchaseId) {
      soldStock.purchaseId = this.stock.purchaseId;
    } else {
      soldStock.purchaseId = uuidv4().substring(0, 8);
    }
    soldStock.date = timeLong;
    console.log(`${userId}`, soldStock);
    this.updateSvc
      .updateUserStock(userId, soldStock)
      .then((res) => {
        this.dialogRef.close(res.message);
      })
      .catch((err) =>
        this.messageSvc.add({
          severity: 'warn',
          summary: 'Failed',
          detail: err.message,
        })
      );
  }
}
