import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';
import { faMugHot, faMugSaucer } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  coffeeIcon = faMugHot;
  coffeeServed = faMugSaucer;
  paymentComplete: boolean = false;
  transactionId!: number;

  @ViewChild('paypalRef', { static: true })
  paypalRef!: ElementRef;

  constructor(
    private themeSvc: ThemeService,
    private title: Title,
    private getSvc: GetService,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    this.title.setTitle(`${this.getSvc.applicationName} | Payment`);
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    // PAYPAL
    console.log(window.paypal);
    window.paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 55,
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: '1.99',
                  currency_code: 'SGD',
                },
              },
            ],
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            if (details.status === 'COMPLETED') {
              this.messageSvc.add({
                severity: 'success',
                summary: 'Success',
                detail: `Thank you ${localStorage.getItem(
                  'firstname'
                )} ${localStorage.getItem(
                  'lastname'
                )}, your payment well received.`,
              });
              this.paymentComplete = true;
              this.transactionId = details.id;
            }
          });
        },
        onError: (error: any) => {
          this.messageSvc.add({
            severity: 'error',
            summary: 'Error',
            detail: `Oh snap, looks like payment failed.`,
          });
        },
      })
      .render(this.paypalRef.nativeElement);
  }
}
