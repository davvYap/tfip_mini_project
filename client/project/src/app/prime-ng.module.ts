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
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { ToolbarModule } from 'primeng/toolbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TagModule } from 'primeng/tag';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PanelModule } from 'primeng/panel';
import { TreeTableModule } from 'primeng/treetable';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepsModule } from 'primeng/steps';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SidebarModule } from 'primeng/sidebar';
import { ImageModule } from 'primeng/image';
import { SliderModule } from 'primeng/slider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { RatingModule } from 'primeng/rating';

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
  CardModule,
  SelectButtonModule,
  SkeletonModule,
  DropdownModule,
  InputMaskModule,
  ToolbarModule,
  ToggleButtonModule,
  TagModule,
  InputTextareaModule,
  PanelModule,
  TreeTableModule,
  BreadcrumbModule,
  SplitButtonModule,
  StepsModule,
  FileUploadModule,
  ConfirmDialogModule,
  ScrollTopModule,
  SidebarModule,
  ImageModule,
  SliderModule,
  InputSwitchModule,
  ProgressBarModule,
  BadgeModule,
  ScrollPanelModule,
  RatingModule,
];

@NgModule({
  imports: primeModules,
  exports: primeModules,
})
export class PrimeNgModule {}
