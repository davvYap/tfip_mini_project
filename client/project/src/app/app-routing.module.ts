import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { loginGuard } from './service/route-guard';
import { LogoutComponent } from './component/logout/logout.component';
import { InvestmentComponent } from './component/investment/investment.component';
import { InvestmentDashboardComponent } from './component/investment-dashboard/investment-dashboard.component';
import { SavingsComponent } from './component/savings/savings.component';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import { TransactionRecordsComponent } from './component/transaction-records/transaction-records.component';
import { MortgageComponent } from './component/mortgage/mortgage.component';
import { MortgageDashboardComponent } from './component/mortgage-dashboard/mortgage-dashboard.component';
import { PaymentComponent } from './component/payment/payment.component';
import { RegularTransactionsComponent } from './component/regular-transactions/regular-transactions.component';
import { StockDetailsComponent } from './component/stock-details/stock-details.component';
import { RealTimePriceComponent } from './component/real-time-price/real-time-price.component';
import { ChatRoomComponent } from './component/chat-room/chat-room.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [loginGuard] },
  { path: 'home', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'investment-dashboard',
    component: InvestmentDashboardComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'investment',
    component: InvestmentComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'stock-details/:symbol',
    component: StockDetailsComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'savings',
    component: SavingsComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'new-transaction',
    component: AddTransactionComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'transaction-records',
    component: TransactionRecordsComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'regular-transactions',
    component: RegularTransactionsComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'mortgage-dashboard',
    component: MortgageDashboardComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'mortgage',
    component: MortgageComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'payment',
    component: PaymentComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'realtime-price',
    component: RealTimePriceComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'chatroom',
    component: ChatRoomComponent,
    canActivate: [loginGuard],
  },
  { path: 'logout', component: LogoutComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
