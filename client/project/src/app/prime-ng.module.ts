import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';
import { ChartModule } from 'primeng/chart';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { OrderListModule } from 'primeng/orderlist';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { KeyFilterModule } from 'primeng/keyfilter';

const primeModules: any[] = [
  ButtonModule,
  InputTextModule,
  MenubarModule,
  PasswordModule,
  MessagesModule,
  ToastModule,
  FieldsetModule,
  ChartModule,
  AutoCompleteModule,
  CheckboxModule,
  RadioButtonModule,
  InputNumberModule,
  CalendarModule,
  OrderListModule,
  OverlayPanelModule,
  KeyFilterModule,
];

@NgModule({
  imports: primeModules,
  exports: primeModules,
})
export class PrimeNgModule {}
