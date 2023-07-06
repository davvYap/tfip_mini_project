import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GetService } from 'src/app/service/get.service';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { SocialUser } from '@abacritt/angularx-social-login';
import { GoogleSigninButtonDirective } from '@abacritt/angularx-social-login/public-api';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login/public-api';

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
  user!: SocialUser;
  loggedIn!: any;

  constructor(
    private fb: FormBuilder,
    private getSvc: GetService,
    private router: Router,
    public dialogRef: DynamicDialogRef,
    private dialogSvc: DialogService,
    private authService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.panelSizes.set([90, 10]);
    this.loginTitle = 'Welcome to am.app';
    this.form = this.createForm();

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null;
      console.log(this.user);
      if (this.user) {
        console.log('user login');
        this.loginGoogle();
      }
    });
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

  loginGoogle(): void {
    this.getSvc.isLogin = true;
    this.getSvc.userId = this.user.id;
    this.getSvc.username = this.user.name;
    this.getSvc.firstname = this.user.firstName;
    this.getSvc.lastname = this.user.lastName;
    this.getSvc.isLogin$.next(true);
    localStorage.setItem('isLogin', 'true');
    localStorage.setItem('userId', this.user.id);
    localStorage.setItem('username', this.user.name);
    localStorage.setItem('firstname', this.user.firstName);
    localStorage.setItem('lastname', this.user.lastName);
    this.router.navigate(['/dashboard']);
    this.dialogRef.close(this.user.name);
  }
}
