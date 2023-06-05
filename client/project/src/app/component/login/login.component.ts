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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  constructor(
    private primengConfig: PrimeNGConfig,
    private fb: FormBuilder,
    private router: Router,
    private getSvc: GetService,
    private messageService: MessageService
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
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        alert('Invalid username or password');
      });
  }

  showLogoutMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Logout Successfully',
    });
  }
}
