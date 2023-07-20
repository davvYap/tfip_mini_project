import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  WritableSignal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, Subscription, map } from 'rxjs';
import { Categories, categoryOptionItem } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';
import { UpdateService } from 'src/app/service/update.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css'],
})
export class EditCategoryComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  categoriesItems!: categoryOptionItem[];
  selectedCategoryType = signal;
  selectedCategory: WritableSignal<Categories | null> = signal(null);
  selectedCategoryString!: string;

  getUserCategoriesSub$!: Subscription;

  typesItems = [
    { label: 'Income', value: 'income' },
    { label: 'Expense', value: 'expense' },
  ];
  selectedType!: any;

  constructor(
    private updateSvc: UpdateService,
    private themeSvc: ThemeService,
    private fb: FormBuilder,
    public dialogRef: DynamicDialogRef,
    private messageSvc: MessageService,
    private getSvc: GetService
  ) {}

  ngOnInit(): void {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');

    this.form = this.createForm(this.selectedCategory());

    this.categoriesItems = [];
    this.getUserCategoriesSub$ = this.getSvc
      .getUserCategories(this.getSvc.userId)
      .pipe(
        map((cats: Categories[]) => {
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
  }

  ngOnDestroy(): void {
    if (this.getUserCategoriesSub$) this.getUserCategoriesSub$.unsubscribe();
  }

  createForm(selectedCategory: Categories | null): FormGroup {
    return this.fb.group({
      categoryId: this.fb.control(
        !!selectedCategory ? selectedCategory.categoryId : ''
      ),
      categoryName: this.fb.control(
        !!selectedCategory ? selectedCategory.categoryName : '',
        [Validators.required]
      ),
      categoryType: this.fb.control(
        !!selectedCategory ? selectedCategory.type : '',
        [Validators.required]
      ),
    });
  }

  getSeverity(type: string): string {
    return type === 'income' ? 'success' : 'danger';
  }

  getSelectedCategoryType(): string {
    let type = '';
    this.categoriesItems.map((cat) => {
      if (cat.object.categoryName === this.selectedCategoryString) {
        type = cat.object.type;
      }
    });
    return type;
  }

  getSeverityType(): string {
    let type = '';
    this.categoriesItems.map((cat) => {
      if (cat.object.categoryName === this.selectedCategoryString) {
        type = cat.object.type;
      }
    });
    // console.log(type);
    return type === 'income' ? 'success' : 'danger';
  }

  getTagSeverityType(): string {
    return this.selectedType === 'income' ? 'success' : 'danger';
  }

  updateCategory() {
    const cat: Categories = {
      categoryId: this.form.get('categoryId')?.value,
      categoryName: this.form.get('categoryName')?.value,
      type: this.form.get('categoryType')?.value,
      total: 0,
    };

    this.updateSvc
      .updateCategory(this.getSvc.userId, cat)
      .then((res) => {
        this.dialogRef.close(res.message);
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'warn',
          summary: 'Failed',
          detail: err.error.message,
        });
      });
  }

  selectCategory(catName: string) {
    this.categoriesItems.map((catItems) => {
      if (catName === catItems.value) {
        this.selectedCategory.set(catItems.object);
      }
    });
    this.selectedType = this.selectedCategory()?.type;
    this.form = this.createForm(this.selectedCategory());
  }
}
