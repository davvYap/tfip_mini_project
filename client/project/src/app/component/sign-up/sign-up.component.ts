import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import {
  faEnvelope,
  faKey,
  faUnlockKeyhole,
  faRightToBracket,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FileUploadEvent } from 'primeng/fileupload';
import { LoginStatus, SignUp } from 'src/app/models';
import { PostService } from 'src/app/service/post.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { GetService } from 'src/app/service/get.service';
import { Router } from '@angular/router';
import { UpdateService } from 'src/app/service/update.service';

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
  confirmDetialsIcon = faCheck;
  pageItems!: MenuItem[];
  uploadedFiles: File[] = [];
  uploadedFile!: File;
  imageUrl!: string;
  newUser!: SignUp;
  newUserPassword!: string;
  activeIndex: number = 0;
  form!: FormGroup;
  samePassword: boolean = true;
  pStepsReadOnly: boolean = true;
  showCaptcha: boolean = false;
  captchaError: string | undefined;
  isSignUp!: boolean;
  showSignUpLoading: boolean = false;
  showUpdateUserLoading: boolean = false;

  @ViewChild('captchaInput', { static: false })
  captchaInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private postSvc: PostService,
    public dialogRef: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig,
    private getSvc: GetService,
    private router: Router,
    private updateSvc: UpdateService,
    private messageSvc: MessageService
  ) {}

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

    const user: SignUp = this.dialogConfig.data.signUp;
    // console.log(this.dialogConfig.data.signUp);
    this.form = this.createForm(user);
    if (user === null) {
      this.isSignUp = true;
    } else {
      this.isSignUp = false;
    }
  }

  createForm(user: SignUp | null): FormGroup {
    return this.fb.group({
      firstname: this.fb.control(
        !!user ? user.firstname : '',
        Validators.required
      ),
      lastname: this.fb.control(
        !!user ? user.lastname : '',
        Validators.required
      ),
      username: this.fb.control(!!user ? user.username : '', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
      ]),
      email: this.fb.control(!!user ? user.email : '', [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.control(
        !!user ? user.password : '',
        Validators.required
      ),
      confirmPassword: this.fb.control('', Validators.required),
    });
  }

  onActiveIndexChange(event: number) {
    this.captchaError = undefined;
    const newUser = this.form.value as SignUp;
    this.newUser = newUser;

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
    // console.log(event.files);
    this.uploadedFiles.push(event.files[0]);
    this.uploadedFile = event.files[0];
    this.readImage(this.uploadedFile);
    const newUser = this.form.value as SignUp;
    this.newUser = newUser;
    this.nextPage();
    this.pStepsReadOnly = false;
    this.newUserPassword = this.createEncryptedPassword(newUser.password);
  }

  createEncryptedPassword(password: string): string {
    let encryptedPassword = '';
    for (let i = 0; i < password.length; i++) {
      encryptedPassword += 'x';
    }
    return encryptedPassword;
  }

  togglePassword() {
    if (
      this.newUserPassword.match(
        this.createEncryptedPassword(this.newUser.password)
      )
    ) {
      this.newUserPassword = this.newUser.password;
    } else {
      this.newUserPassword = this.createEncryptedPassword(this.newUserPassword);
    }
  }

  readImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  confirmDetails() {
    const newUser = this.form.value as SignUp;
    this.showCaptcha = true;
    this.getSvc
      .getCaptcha(newUser.username, newUser.email)
      .then((res) => {})
      .catch((err) => {
        console.log(err.error.message);
        this.captchaError = err.error.message;
      });
  }

  signUp() {
    const newUser = this.form.value as SignUp;
    // newUser.profileIcon = this.imageUrl;
    this.newUser = newUser;
    // console.log(newUser);
    const captcha: string = this.captchaInput.nativeElement.value;
    const formData = new FormData();
    formData.append('firstname', newUser.firstname);
    formData.append('lastname', newUser.lastname);
    formData.append('username', newUser.username);
    formData.append('password', newUser.password);
    formData.append('email', newUser.email);
    formData.append('file', this.uploadedFile);
    formData.append('captcha', captcha);

    this.showSignUpLoading = true;
    this.postSvc
      .signUp(formData)
      .then((res) => {
        this.dialogRef.close();
        // console.log(res.message);
        this.getSvc
          .verifyLogin(newUser.username, newUser.password)
          .then((res: LoginStatus) => {
            this.getSvc.initiateLoginProcedure(res);
            this.router.navigate(['/dashboard']);
            this.dialogRef.close(res.username);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        // console.log(err.error.message);
        this.captchaError = err.error.message;
      });
  }

  updateUserProfile() {
    const newUser = this.form.value as SignUp;
    this.newUser = newUser;
    const formData = new FormData();
    formData.append('firstname', newUser.firstname);
    formData.append('lastname', newUser.lastname);
    formData.append('username', newUser.username);
    formData.append('password', newUser.password);
    formData.append('email', newUser.email);
    formData.append('file', this.uploadedFile);
    this.showUpdateUserLoading = true;
    this.updateSvc
      .updateUserProfile(this.getSvc.userId, formData)
      .then((msg) => {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Success',
          detail: msg.message,
        });
        this.dialogRef.close();
        this.getSvc
          .verifyLogin(newUser.username, newUser.password)
          .then((res: LoginStatus) => {
            this.getSvc.initiateLoginProcedure(res);
            this.dialogRef.close(res.username);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        this.showUpdateUserLoading = false;
        this.messageSvc.add({
          severity: 'error',
          summary: 'Failed',
          detail: err.error.message,
        });
      });
  }
}
