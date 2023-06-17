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
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { TableModule } from 'primeng/table';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DividerModule } from 'primeng/divider';

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
  TooltipModule,
  TabViewModule,
  AvatarModule,
  TableModule,
  ConfirmPopupModule,
  DynamicDialogModule,
  DividerModule,
];

@NgModule({
  imports: primeModules,
  exports: primeModules,
})
export class PrimeNgModule {}
