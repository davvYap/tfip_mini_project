import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MortgagePortfolio } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { UpdateService } from 'src/app/service/update.service';

@Component({
  selector: 'app-add-mortgage',
  templateUrl: './add-mortgage.component.html',
  styleUrls: ['./add-mortgage.component.css'],
})
export class AddMortgageComponent implements OnInit {
  form!: FormGroup;
  idPattern: RegExp = /^#/;
  showUpdateUpdateButton!: boolean;

  constructor(
    private themeSvc: ThemeService,
    private fb: FormBuilder,
    private dialogConfig: DynamicDialogConfig,
    private postSvc: PostService,
    private getSvc: GetService,
    private messageSvc: MessageService,
    public dialogRef: DynamicDialogRef,
    private updateSvc: UpdateService
  ) {}

  ngOnInit(): void {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');

    // FROM MORTGAGE COMPONENT
    const mortgagePort: MortgagePortfolio =
      this.dialogConfig.data.mortgagePortfolio;
    if (mortgagePort.new) {
      this.showUpdateUpdateButton = false;
    } else {
      this.showUpdateUpdateButton = true;
    }
    this.form = this.createForm(mortgagePort);
  }

  createForm(mortgage: MortgagePortfolio | null): FormGroup {
    return this.fb.group({
      id: this.fb.control(!!mortgage ? mortgage.id : '', [
        Validators.required,
        Validators.minLength(2),
      ]),
      loanAmount: this.fb.control(!!mortgage ? mortgage.loanAmount : '', [
        Validators.required,
      ]),
      monthlyRepayment: this.fb.control(
        !!mortgage ? mortgage.monthlyRepayment : '',
        [Validators.required]
      ),
      totalRepayment: this.fb.control(
        !!mortgage ? mortgage.totalRepayment : '',
        [Validators.required]
      ),
      interest: this.fb.control(!!mortgage ? mortgage.interest : '', [
        Validators.required,
      ]),
      totalPeriod: this.fb.control(!!mortgage ? mortgage.totalPeriod : '', [
        Validators.required,
      ]),
    });
  }

  invalidMortgageId(): boolean {
    return !this.idPattern.test(this.form.get('id')?.value) && this.form.dirty;
  }

  invalidForm(): boolean {
    return this.form.invalid || this.invalidMortgageId();
  }

  addMortgagePortfolio() {
    const newMort = this.form.value as MortgagePortfolio;
    // console.log(newMort);
    this.postSvc
      .addUserMortgagePortfolio(this.getSvc.userId, newMort)
      .then((msg) => {
        this.dialogRef.close(msg.message);
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      });
  }

  updateMortgageProfile() {
    const mort = this.form.value as MortgagePortfolio;
    this.updateSvc
      .updateUserMortgagePortfolio(this.getSvc.userId, mort)
      .then((msg) => {
        this.dialogRef.close(msg.message);
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      });
  }
}
