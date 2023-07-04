import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GetService } from 'src/app/service/get.service';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { faKey } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css'],
})
export class AuthenticationComponent implements OnInit {
  passwordIcon = faKey;
  panelSizes: WritableSignal<number[]> = signal([]);
  imgSrc: string = '/assets/images/user2.png';
  imgClass: string = 'user-img';
  loginTitle!: string;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private getSvc: GetService,
    private router: Router,
    public dialogRef: DynamicDialogRef,
    private dialogSvc: DialogService
  ) {}

  ngOnInit(): void {
    this.panelSizes.set([90, 10]);
    this.loginTitle = 'Welcome to am.app';
    this.form = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
    });
  }

  login(): void {
    const username: string = this.form.get('username')?.value;
    const password: string = this.form.get('password')?.value;
    this.getSvc
      .verifyLogin(username, password)
      .then((res) => {
        this.getSvc.isLogin = res.isLogin;
        this.getSvc.userId = res.userId;
        this.getSvc.username = res.username;
        this.getSvc.firstname = res.firstname;
        this.getSvc.lastname = res.lastname;
        this.getSvc.isLogin$.next(true);
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('username', res.username);
        localStorage.setItem('firstname', res.firstname);
        localStorage.setItem('lastname', res.lastname);
        this.router.navigate(['/dashboard']);
        this.dialogRef.close(res.username);
      })
      .catch((err) => {
        this.imgSrc = '/assets/images/user.png';
        this.imgClass = 'user-img-shake';
        this.loginTitle = 'Invalid username or password';
      });
  }

  resetLoginPage() {
    this.imgSrc = '/assets/images/user2.png';
    this.loginTitle = 'Welcome to am.app';
  }

  showSignUpDialog() {
    this.dialogRef.close();
    this.dialogRef = this.dialogSvc.open(SignUpComponent, {
      // header: 'Login',
      width: '50%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });
  }
}
