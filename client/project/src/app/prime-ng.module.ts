import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { PasswordModule } from 'primeng/password';

const primeModules: any[] = [
  ButtonModule,
  InputTextModule,
  MenubarModule,
  PasswordModule,
];

@NgModule({
  imports: primeModules,
  exports: primeModules,
})
export class PrimeNgModule {}
