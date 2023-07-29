import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';

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
import { AuthenticationComponent } from './component/authentication/authentication.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';
import { EditCategoryComponent } from './component/edit-category/edit-category.component';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  GoogleSigninButtonDirective,
  GoogleSigninButtonModule,
} from '@abacritt/angularx-social-login';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { MortgageComponent } from './component/mortgage/mortgage.component';
import { AddMortgageComponent } from './component/add-mortgage/add-mortgage.component';
import { MortgageDashboardComponent } from './component/mortgage-dashboard/mortgage-dashboard.component';
import { PaymentComponent } from './component/payment/payment.component';
import { StockDetailsComponent } from './component/stock-details/stock-details.component';
import { RegularTransactionsComponent } from './component/regular-transactions/regular-transactions.component';
import { AddCategoryComponent } from './component/add-category/add-category.component';
import { RealTimePriceComponent } from './component/real-time-price/real-time-price.component';

// Export this function
export function playerFactory(): any {
  return import('lottie-web');
}

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
    EditCategoryComponent,
    MortgageComponent,
    AddMortgageComponent,
    MortgageDashboardComponent,
    PaymentComponent,
    StockDetailsComponent,
    RegularTransactionsComponent,
    AddCategoryComponent,
    RealTimePriceComponent,
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
    SocialLoginModule,
    GoogleSigninButtonModule,
    CommonModule,
    LottieModule.forRoot({ player: playerFactory }),
  ],
  providers: [
    MessageService,
    ConfirmationService,
    DialogService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '993725644664-0ltkao19ker6dp0lomiabeuuqogkuoor.apps.googleusercontent.com'
            ),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    GoogleSigninButtonDirective,
    DecimalPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
