import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrimeNgModule } from './prime-ng.module';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { LogoutComponent } from './component/logout/logout.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InvestmentComponent } from './component/investment/investment.component';
import { InvestmentDashboardComponent } from './component/investment-dashboard/investment-dashboard.component';
import { DialogService } from 'primeng/dynamicdialog';
import { SellStockComponent } from './component/sell-stock/sell-stock.component';
import { SavingsComponent } from './component/savings/savings.component';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TransactionRecordsComponent } from './component/transaction-records/transaction-records.component';
import { DatePipe } from '@angular/common';
import { AuthenticationComponent } from './component/authentication/authentication.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    LogoutComponent,
    InvestmentComponent,
    InvestmentDashboardComponent,
    SellStockComponent,
    SavingsComponent,
    AddTransactionComponent,
    TransactionRecordsComponent,
    AuthenticationComponent,
    SignUpComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    PrimeNgModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
  ],
  providers: [MessageService, ConfirmationService, DialogService],
  bootstrap: [AppComponent],
})
export class AppModule {}
