import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import {
  faEnvelope,
  faKey,
  faUnlockKeyhole,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FileUploadEvent } from 'primeng/fileupload';
import { SignUp } from 'src/app/models';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  loginIcon = faRightToBracket;
  emailIcon = faEnvelope;
  passwordIcon = faKey;
  confirmPasswordIcon = faUnlockKeyhole;
  pageItems!: MenuItem[];
  uploadedFiles: File[] = [];
  uploadedFile!: File;
  imageUrl!: string;
  newUser!: SignUp;
  activeIndex: number = 0;
  form!: FormGroup;
  samePassword: boolean = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.pageItems = [
      {
        label: 'Personal Information',
        command: (event: any) => {},
      },
      {
        label: 'Profile Icon',
        command: (event: any) => {},
      },
      {
        label: 'Confirmation',
        command: (event: any) => {},
      },
    ];

    this.form = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstname: this.fb.control('', Validators.required),
      lastname: this.fb.control('', Validators.required),
      username: this.fb.control('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
      ]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', Validators.required),
      confirmPassword: this.fb.control('', Validators.required),
    });
  }

  onActiveIndexChange(event: number) {
    const firstPage = document.getElementById('pageOne');
    const secondPage = document.getElementById('pageTwo');
    const lastPage = document.getElementById('pageThree');
    if (event === 1) {
      this.activeIndex = event;
      firstPage!.style.display = 'none';
      secondPage!.style.display = 'inline';
      lastPage!.style.display = 'none';
    } else if (event === 2) {
      this.activeIndex = event;
      firstPage!.style.display = 'none';
      secondPage!.style.display = 'none';
      lastPage!.style.display = 'inline';
    } else {
      this.activeIndex = event;
      firstPage!.style.display = 'inline';
      secondPage!.style.display = 'none';
      lastPage!.style.display = 'none';
    }
  }

  differentPassword(): boolean {
    return (
      !!this.form.get('confirmPassword')?.dirty &&
      this.form.value.password !== this.form.value.confirmPassword
    );
  }

  invalidForm(): boolean {
    return (
      this.form.value.password !== this.form.value.confirmPassword ||
      this.form.invalid
    );
  }

  nextPage() {
    const firstPage = document.getElementById('pageOne');
    const secondPage = document.getElementById('pageTwo');
    const lastPage = document.getElementById('pageThree');
    if (this.activeIndex === 0) {
      this.activeIndex++;
      firstPage!.style.display = 'none';
      secondPage!.style.display = 'inline';
      lastPage!.style.display = 'none';
    } else {
      this.activeIndex++;
      firstPage!.style.display = 'none';
      secondPage!.style.display = 'none';
      lastPage!.style.display = 'inline';
    }
  }

  onUpload(event: FileUploadEvent) {
    console.log(event.files);
    this.uploadedFiles.push(event.files[0]);
    this.uploadedFile = event.files[0];
    this.readImage(this.uploadedFile);
    this.nextPage();
    const newUser = this.form.value as SignUp;
    newUser.profileIcon = this.imageUrl;
    console.log(newUser);
    this.newUser = newUser;
  }

  readImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
