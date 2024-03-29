import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { switchMap, forkJoin, Observable, map, tap } from 'rxjs';
import { Categories, Transaction, categoryOptionItem } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css'],
})
export class AddTransactionComponent implements OnInit {
  form!: FormGroup;
  categoriesItems!: categoryOptionItem[];
  typesItems = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ];
  selectedCategory = signal('');
  selectedCategoryType = signal;

  constructor(
    private themeSvc: ThemeService,
    private fb: FormBuilder,
    private getSvc: GetService,
    private postSvc: PostService,
    public dialogRef: DynamicDialogRef,
    private messageSvc: MessageService,
    private dialogConfig: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');

    this.categoriesItems = [];
    this.getSvc
      .getUserCategories(this.getSvc.userId)
      .pipe(
        map((cats) => {
          const sortedCats = cats.sort((a, b) =>
            a.categoryName.localeCompare(b.categoryName)
          );
          sortedCats.map((cat) => {
            const catName: string = cat.categoryName;
            this.categoriesItems.push({
              label: catName,
              value: catName,
              object: cat,
            });
          });
        })
      )
      .subscribe();

    // FROM MORTGAGE COMPONENT
    const mortgageMonthlyPayment: Transaction =
      this.dialogConfig.data.mortgageMonthlyPayment;

    this.form = this.createForm(mortgageMonthlyPayment);
  }

  createForm(tran: Transaction | null): FormGroup {
    return this.fb.group({
      date: this.fb.control(!!tran ? tran.date : '', Validators.required),
      transactionName: this.fb.control(
        !!tran ? tran.transactionName : '',
        Validators.required
      ),
      amount: this.fb.control(!!tran ? tran.amount : '', Validators.required),
      categoryName: this.fb.control(
        !!tran ? tran.categoryName : '',
        Validators.required
      ),
      remarks: this.fb.control(!!tran ? tran.remarks : ''),
      regular: this.fb.control(!!tran ? tran.regular : false),
    });
  }

  invalidForm(): boolean {
    return (
      this.form.invalid ||
      !(typeof this.form.get('categoryName')?.value === 'string')
    );
  }

  getSeverity(type: string): string {
    return type === 'income' ? 'success' : 'danger';
  }

  saveTransaction() {
    const id: string = uuidv4().substring(0, 8);
    const tran: Transaction = this.form.value as Transaction;
    const date: string = this.form.get('date')?.value;
    const newDate = this.convertFromDateToString(date);
    // console.log(newDate);
    tran.date = newDate;
    tran.transactionId = id;
    // console.log(tran);

    this.postSvc
      .addTransaction(this.getSvc.userId, tran)
      .then((msg) => {
        this.dialogRef.close(msg.message);
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'warn',
          summary: 'Failed',
          detail: err.message,
        });
      });
  }

  convertFromDateToString(date: string): string {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
    const day = newDate.getDate().toString().padStart(2, '0');
    const formattedDate = year + '-' + month + '-' + day;
    return formattedDate;
  }

  getSelectedCategoryType(): string {
    let type = '';
    this.categoriesItems.map((cat) => {
      if (cat.object.categoryName === this.selectedCategory) {
        type = cat.object.type;
      }
    });
    return type;
  }

  getSeverityType(): string {
    let type = '';
    this.categoriesItems.map((cat) => {
      if (cat.object.categoryName === this.selectedCategory) {
        type = cat.object.type;
      }
    });
    return type === 'income' ? 'success' : 'danger';
  }
}
