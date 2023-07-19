import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GetService } from 'src/app/service/get.service';
import { PostService } from 'src/app/service/post.service';
import { ThemeService } from 'src/app/service/theme.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css'],
})
export class AddCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  categories!: string[];
  typeOptions: any[] = [
    { label: 'Expense', value: 'expense' },
    { label: 'Income', value: 'income' },
  ];
  postCategory$!: Subscription;

  constructor(
    private fb: FormBuilder,
    private postSvc: PostService,
    private themeSvc: ThemeService,
    private getSvc: GetService,
    public dialogRef: DynamicDialogRef,
    private messageSvc: MessageService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.createCategoryForm();
  }

  createCategoryForm(): FormGroup {
    this.themeSvc.switchTheme(localStorage.getItem('theme') || '');
    this.categories = ['Income', 'Expense'];

    return this.fb.group({
      category: this.fb.control('', Validators.required),
      type: this.fb.control('expense', Validators.required),
    });
  }

  addCategory() {
    const category: string = this.categoryForm.get('category')?.value;
    const type: string = this.categoryForm.get('type')?.value;
    this.postCategory$ = this.postSvc
      .addCategory(this.getSvc.userId, category, type)
      .subscribe({
        next: (message) => {
          this.dialogRef.close(message.message);
        },
        error: (error) => {
          this.messageSvc.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message,
          });
        },
        complete: () => {
          this.postCategory$.unsubscribe();
        },
      });
  }
}
