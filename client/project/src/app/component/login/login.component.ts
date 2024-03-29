import {
  Component,
  OnInit,
  AfterViewInit,
  AfterContentInit,
  HostListener,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { GetService } from 'src/app/service/get.service';
import { ThemeService } from 'src/app/service/theme.service';
import { Title } from '@angular/platform-browser';

import {
  faAnglesDown,
  faArrowTrendUp,
  faCalculator,
  faChartSimple,
  faHandPointUp,
  faPieChart,
  faShareFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationComponent } from '../authentication/authentication.component';
import { BreakpointService } from 'src/app/service/breakpoint.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  downIcon = faAnglesDown;
  investmentIcon = faArrowTrendUp;
  calculator = faCalculator;
  pieChartIcon = faPieChart;
  chartIcon = faChartSimple;
  shareIcon = faShareFromSquare;
  pointUpIcon = faHandPointUp;
  displayButton = false;
  form!: FormGroup;
  imgSrc: string = '/assets/images/user2.png';
  imgClass: string = 'user-img';
  loginTitle!: string;
  dialogRef!: DynamicDialogRef;

  animationOptions1: AnimationOptions = {
    path: 'assets/lottie/general-charts.json',
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  animationOptions2: AnimationOptions = {
    path: 'assets/lottie/linechart.json',
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  animationOptions3: AnimationOptions = {
    path: 'assets/lottie/donutchart.json',
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  animationOptions4: AnimationOptions = {
    path: 'assets/lottie/mortgage.json',
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  constructor(
    private primengConfig: PrimeNGConfig,
    private fb: FormBuilder,
    private router: Router,
    private getSvc: GetService,
    private messageService: MessageService,
    private themeSvc: ThemeService,
    private title: Title,
    private dialogSvc: DialogService,
    private elementRef: ElementRef,
    private breakpointSvc: BreakpointService
  ) {}

  ngOnInit(): void {
    this.title.setTitle(`${this.getSvc.applicationName} | Home`);
    this.primengConfig.ripple = true;
    this.getSvc.isLogin = false;
    this.loginTitle = 'Login';
    this.form = this.createForm();
    // this.initBreakpointObserver();
    this.breakpointSvc.initBreakpointObserver();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.getSvc.isLogin && this.getSvc.isLogout)
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
        this.getSvc.userId = res.userId;
        this.getSvc.username = res.username;
        this.getSvc.isLogin$.next(true);
        localStorage.setItem('isLogin', 'true');
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('username', res.username);
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        this.imgSrc = '/assets/images/user.png';
        this.imgClass = 'user-img-shake';
        this.loginTitle = 'Wrong username or password...';
      });
  }

  showLogoutMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Logout Successfully',
    });
  }

  resetLoginPage() {
    this.imgSrc = '/assets/images/user2.png';
    this.loginTitle = 'Login';
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrollFunction();
  }

  scrollFunction() {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      this.displayButton = true;
    } else {
      this.displayButton = false;
    }
  }

  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  onAnimate(animationItem: AnimationItem): void {
    // console.log(animationItem);
  }

  showLoginDialog() {
    // console.log(this.breakpointSvc.currentBreakpoint);
    this.dialogRef = this.dialogSvc.open(AuthenticationComponent, {
      // header: 'Login',
      width: this.breakpointSvc.currentBreakpoint,
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });

    this.dialogRef.onClose.subscribe();
  }

  share() {
    const data: any = {
      title: 'Welcome to am.app',
      text: `I invites you to join am.app ! Manage all your assets in single application for free. Click link below to join.`,
      url: 'https://amapp.up.railway.app/',
    };
    navigator
      .share(data)
      .then(() => {
        console.log('Shared');
      })
      .catch((error) => alert(`Error: ${error.message}`));
  }

  scrollToElement(id: string) {
    const element = this.elementRef.nativeElement.querySelector('#' + id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
