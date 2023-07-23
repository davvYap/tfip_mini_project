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
import { PostService } from 'src/app/service/post.service';
import { GoogleUser } from 'src/app/models';
import { BreakpointService } from 'src/app/service/breakpoint.service';

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
  googleLogInShowLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private getSvc: GetService,
    private router: Router,
    public dialogRef: DynamicDialogRef,
    private dialogSvc: DialogService,
    private authService: SocialAuthService,
    private postSvc: PostService,
    private breakpointSvc: BreakpointService
  ) {}

  ngOnInit(): void {
    this.panelSizes.set([90, 10]);
    this.loginTitle = 'Sign in to am.app';
    this.form = this.createForm();

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null;
      // console.log(this.user);
      if (this.user) {
        console.log('user login');
        this.googleLogInShowLoading = true;
        this.loginGoogle();
      }
    });

    this.breakpointSvc.initBreakpointObserver();
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
        this.getSvc.initiateLoginProcedure(res);
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
      width: this.breakpointSvc.currentBreakpoint,
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
      data: { signUp: null },
    });
  }

  loginGoogle(): void {
    // console.log(this.user);
    const googleUser: GoogleUser = {
      userId: this.user.id,
      username: this.user.name ? this.user.name : '',
      password: this.user.id,
      firstname: this.user.firstName ? this.user.firstName : '',
      lastname: this.user.lastName ? this.user.lastName : '',
      email: this.user.email,
    };
    this.postSvc
      .googleUserSignIn(googleUser)
      .then((res) => {
        this.getSvc.initiateGoogleLoginProcedure(this.user);
        this.router.navigate(['/dashboard']);
        this.dialogRef.close(this.user.name);
      })
      .catch((err) => {
        console.log(err);
        this.imgSrc = '/assets/images/user.png';
        this.imgClass = 'user-img-shake';
        this.loginTitle = err.error.message;
      });
  }
}
