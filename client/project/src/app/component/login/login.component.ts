import {
  Component,
  OnInit,
  AfterViewInit,
  AfterContentInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  imgSrc: string = '/assets/images/user2.png';
  imgClass: string = 'user-img';

  constructor(
    private primengConfig: PrimeNGConfig,
    private fb: FormBuilder,
    private router: Router,
    private getSvc: GetService,
    private messageService: MessageService,
    private themeSvc: ThemeService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.getSvc.isLogin = false;

    this.form = this.createForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.getSvc.isLogin && this.getSvc.isLoginRecently)
        this.showLogoutMessage();
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
        this.getSvc.isLoginRecently = res.isLogin;
        this.getSvc.userId = res.userId;
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        this.imgSrc = '/assets/images/user.png';
        this.imgClass = 'user-img-shake';
      });
  }

  showLogoutMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Logout Successfully',
    });
  }

  resetImg() {
    this.imgSrc = '/assets/images/user2.png';
  }
}
