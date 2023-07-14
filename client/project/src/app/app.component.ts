import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { ThemeService } from './service/theme.service';
import { GetService } from './service/get.service';
import { Router } from '@angular/router';
import {
  LoginStatus,
  MessageResponse,
  MortgagePortfolio,
  NotificationMessage,
  SignUp,
  Transaction,
} from './models';
import { PostService } from './service/post.service';
import { Observable, Subscription, forkJoin, map, of, switchMap } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import {
  faRightToBracket,
  faGem,
  IconDefinition,
  faRightFromBracket,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { AuthenticationComponent } from './component/authentication/authentication.component';
import { SignUpComponent } from './component/sign-up/sign-up.component';
import { EditCategoryComponent } from './component/edit-category/edit-category.component';
import { NotificationService } from './service/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  facebookIcon = faFacebookF;
  instaIcon = faInstagram;
  youtubeIcon = faYoutube;
  twitterIcon = faTwitter;
  loginIcon = faRightToBracket;
  rightIcon = faRightFromBracket;
  gearIcon = faGear;
  premiumIcon: IconDefinition = faGem;
  items!: MenuItem[];
  imgSrc!: string;
  updateUsersStockValue$!: Subscription;
  dialogRef!: DynamicDialogRef;
  isLogin: WritableSignal<boolean> = signal(false);
  sidebarVisible: boolean = false;
  userFullname!: string;
  currTime!: string;

  thisYear = signal(new Date().getFullYear());
  savingsValue = signal(0);
  stocksValue = signal(0);
  stockChangePercentage!: number;
  cryptoValue = signal(0);
  totalValue = computed(() => {
    return this.stocksValue() + this.savingsValue() + this.cryptoValue();
  });
  mortgageNumber = signal(0);

  notificationAmount: WritableSignal<string> = signal('0');
  notificationMessages!: NotificationMessage[];
  themes: string[] = [
    'mira',
    'nano',
    'md-light-indigo',
    'md-dark-purple',
    'mdc-dark-deeppurple',
    'viva-dark',
    'lara-dark-teal',
    'arya-green',
  ];

  @ViewChild('appDialog', { static: true })
  appDialog!: ElementRef<HTMLDialogElement>;

  constructor(
    private primengConfig: PrimeNGConfig,
    private themeSvc: ThemeService,
    private getSvc: GetService,
    private postSvc: PostService,
    private router: Router,
    private messageSvc: MessageService,
    private dialogSvc: DialogService,
    private renderer: Renderer2,
    private el: ElementRef,
    private confirmationSvc: ConfirmationService,
    private notificationSvc: NotificationService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    this.primengConfig.zIndex = {
      modal: 1100, // dialog, sidebar
      overlay: 1000, // dropdown, overlaypanel
      menu: 1000, // overlay menus
      tooltip: 1100, // tooltip
    };

    this.items = this.getMenuItem(this.isLogin());

    this.getSvc.isLogin$.subscribe((isLogin: boolean) => {
      this.items = this.getMenuItem(isLogin);
      this.isLogin.set(true);
      if (this.isLogin()) {
        this.isLogin.set(isLogin);
        const profileIcon: string | null = localStorage.getItem('profileIcon');
        if (profileIcon === null || profileIcon === '') {
          this.imgSrc = '/assets/images/puzzle.png';
        } else {
          this.imgSrc = profileIcon;
        }
        this.userFullname = `${localStorage.getItem(
          'firstname'
        )} ${localStorage.getItem('lastname')}`;
      } else {
        this.imgSrc = '';
        this.isLogin.set(false);
      }
    });

    this.currTime = new Date().toDateString();

    this.notificationSvc.newNotification$.subscribe(
      (notifications: NotificationMessage[]) => {
        let totalNotiNum = 0;
        notifications.map((noti) => {
          totalNotiNum++;
        });
        this.notificationAmount.set(totalNotiNum.toString());
        this.notificationMessages = notifications;
      }
    );

    this.notificationMessages = [];
  }

  getMenuItem(isLogin: boolean): MenuItem[] {
    if (isLogin) {
      return [
        {
          label: 'Investment',
          icon: 'pi pi-fw pi-chart-bar',
          items: [
            {
              label: 'New',
              icon: 'pi pi-fw pi-plus',
              items: [
                {
                  label: 'Stock',
                  icon: 'pi pi-fw pi-apple',
                  routerLink: '/investment',
                },
                {
                  label: 'Crypto',
                  icon: 'pi pi-fw pi-bitcoin',
                  disabled: true,
                },
              ],
            },

            {
              label: 'Update',
              icon: 'pi pi-fw pi-external-link',
              command: () => this.triggerUpdateUsersStockValue(),
            },
            {
              separator: true,
            },
            {
              label: 'Portfolio',
              icon: 'pi pi-fw pi-chart-line',
              routerLink: '/investment-dashboard',
            },
          ],
        },
        {
          label: 'Savings',
          icon: 'pi pi-fw pi-wallet',
          items: [
            {
              label: 'New',
              icon: 'pi pi-fw pi-plus',
              items: [
                {
                  label: 'Transaction',
                  icon: 'pi pi-fw pi-ticket',
                  command: () => this.newTransaction(),
                },
                {
                  label: 'Category',
                  icon: 'pi pi-fw pi-cart-plus',
                  routerLink: '/savings',
                },
              ],
            },
            {
              label: 'Edit',
              icon: 'pi pi-fw pi-file-edit',
              items: [
                {
                  label: 'Category',
                  icon: 'pi pi-fw pi-ticket ',
                  command: () => this.editCategory(),
                },
              ],
            },
            {
              label: 'Records',
              icon: 'pi pi-fw pi-history',
              routerLink: '/transaction-records',
            },
            {
              separator: true,
            },
            {
              label: 'Dashboard',
              icon: 'pi pi-fw pi-chart-bar',
              routerLink: '/savings',
            },
          ],
        },
        {
          label: 'Mortgage',
          icon: 'pi pi-fw pi-home',
          items: [
            {
              label: 'Calculator',
              icon: 'pi pi-fw pi-calculator',
              routerLink: '/mortgage',
            },
            {
              separator: true,
            },
            {
              label: 'Dashboard',
              icon: 'pi pi-fw pi-chart-line',
              routerLink: '/mortgage-dashboard',
            },
          ],
        },
        {
          label: 'Users',
          icon: 'pi pi-fw pi-user',
          items: [
            {
              label: 'Themes',
              icon: 'pi pi-fw pi-palette',
              items: [
                {
                  label: 'Mira',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(0),
                },
                {
                  label: 'Nano',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(1),
                },
                {
                  label: 'MD Light Indigo',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(2),
                },
                {
                  label: 'MD Dark Purple',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(3),
                },
                {
                  label: 'MDC Dark',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(4),
                },
                {
                  label: 'Viva Dark',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(5),
                },
                {
                  label: 'Lara Dark Teal',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(6),
                },
                {
                  label: 'Arya Green',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(7),
                },
              ],
            },
            {
              label: 'Setting',
              icon: 'pi pi pi-spin pi-cog',
              disabled: this.isGoogleUser(),
              command: () => this.showUserSettingDialog(),
            },
          ],
        },
        {
          label: 'Coffee',
          icon: 'pi pi-fw pi-paypal',
          routerLink: '/payment',
        },
      ];
    } else {
      return [
        {
          label: 'Features',
          icon: 'pi pi-fw pi-table',
          command: () => this.scrollToElement('features'),
        },
        // {
        //   label: 'Premium',
        //   icon: 'pi pi-fw pi-verified',
        // },
        {
          label: 'Contact Us',
          icon: 'pi pi-fw pi-telegram',
          command: () => this.scrollToElement('footer'),
        },
      ];
    }
  }

  changeTheme(i: number) {
    let theme = this.themes[i];
    this.themeSvc.switchTheme(theme);
    this.themeSvc.switchTheme$.next(true);
    let userId = this.getSvc.userId;
    this.postSvc.updateUserTheme(userId, theme);
    localStorage.setItem('theme', theme);
  }

  logoutConfirmation() {
    this.confirmationSvc.confirm({
      message: 'Are you sure you want to leave?',
      header: 'Logout Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.sidebarVisible = false;
        this.logout();
      },
      reject: () => {},
    });
  }

  logout() {
    this.getSvc.isLogin = false;
    this.getSvc.isLogout = true;
    this.getSvc.isLogin$.next(false);
    this.getSvc.logout();
    localStorage.removeItem('isLogin');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoginRecently');
    localStorage.removeItem('username');
    localStorage.removeItem('firstname');
    localStorage.removeItem('lastname');
    localStorage.removeItem('theme');
    localStorage.removeItem('profileIcon');
    this.themeSvc.switchTheme('mira');
    this.router.navigate(['/home']);
    this.ngOnInit();
  }

  checkLoginStatus(): void {
    this.getSvc
      .checkLoginStatus()
      .then((res: LoginStatus) => {
        console.log('user login >>> ', res.isLogin);
        console.log('userId >>> ', res.userId);
      })
      .catch((err) => {
        console.log('user login >>> ', err.isLogin);
      });
  }

  showLoginDialog() {
    this.dialogRef = this.dialogSvc.open(AuthenticationComponent, {
      // header: 'Login',
      width: '50%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });

    this.dialogRef.onClose.subscribe();
  }

  showSignUpDialog() {
    this.dialogRef = this.dialogSvc.open(SignUpComponent, {
      // header: 'Login',
      width: '50%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
      data: { signUp: null },
    });

    this.dialogRef.onClose.subscribe();
  }

  isGoogleUser(): boolean {
    if (this.getSvc.userId.length > 8) {
      return true;
    } else {
      return false;
    }
  }

  showUserSettingDialog() {
    this.getSvc
      .getUserProfile(this.getSvc.userId)
      .then((res) => {
        const user: SignUp = res;
        this.dialogRef = this.dialogSvc.open(SignUpComponent, {
          // header: 'Login',
          width: '50%',
          // height: '90%',
          contentStyle: { overflow: 'auto' },
          baseZIndex: 10000,
          maximizable: true,
          dismissableMask: true,
          data: { signUp: user },
        });
        this.dialogRef.onClose.subscribe(() => {
          this.sidebarVisible = false;
        });
      })
      .catch((err) => {
        this.messageSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: 'User not found',
        });
      });
  }

  triggerUpdateUsersStockValue() {
    this.updateUsersStockValue$ = this.getSvc
      .triggerUpdateUsersStockValue()
      .subscribe({
        next: (message) => {
          this.messageSvc.add({
            severity: 'success',
            summary: 'Success',
            detail: message.message,
          });
        },
        error: (error) => {
          this.messageSvc.add({
            severity: 'error',
            summary: 'Failed',
            detail: 'Failed to update users total stock value',
          });
        },
        complete: () => {
          this.updateUsersStockValue$.unsubscribe();
        },
      });
  }

  newTransaction() {
    this.dialogRef = this.dialogSvc.open(AddTransactionComponent, {
      header: 'New Transaction',
      width: '30%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
      data: { mortgageMonthlyPayment: null },
    });

    this.dialogRef.onClose.subscribe((msg) => {
      if (msg !== undefined) {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Successful',
          detail: msg,
        });
        this.ngOnInit();
      }
    });
  }

  editCategory() {
    this.dialogRef = this.dialogSvc.open(EditCategoryComponent, {
      header: 'Edit Category',
      width: '30%',
      // height: '90%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      dismissableMask: true,
    });
    this.dialogRef.onClose.subscribe((msg) => {
      if (msg !== undefined) {
        this.messageSvc.add({
          severity: 'success',
          summary: 'Successful',
          detail: msg,
        });
        this.ngOnInit();
      }
    });
  }

  scrollToElement(elementId: string): void {
    const element = this.el.nativeElement.querySelector('#' + elementId);
    if (element) {
      this.renderer.setProperty(
        document.documentElement,
        'scrollTop',
        element.offsetTop
      );
    }
  }

  showUserDetail() {
    this.sidebarVisible = true;
    this.getUserAssetsValueSideBar();
  }

  navigateTo(route: string): void {
    this.sidebarVisible = false;
    this.router.navigate([route]);
  }

  getUserAssetsValueSideBar() {
    this.stockChangePercentage = 0.0;
    this.getSvc
      .getUserTotalStockValue(this.getSvc.userId)
      .pipe(
        switchMap((res) => {
          this.stocksValue.set(res.value);
          return of(res);
        }),
        switchMap((res) => {
          let observables: Observable<MessageResponse>[] = [];
          const observable = this.getSvc.getUserYesterdayTotalStockValue(
            this.getSvc.userId
          );
          observables.push(observable);
          return forkJoin(observables).pipe(
            map((res2: MessageResponse[]) => {
              const msgRes: MessageResponse = res2[0];
              const yesterdayValue = msgRes.value;
              if (yesterdayValue === 0) {
                this.stockChangePercentage = 0;
              } else {
                this.stockChangePercentage =
                  (this.stocksValue() - yesterdayValue) / yesterdayValue;
              }
              return res;
            })
          );
        })
      )
      .subscribe(() => {
        console.log(this.stocksValue());
      });

    this.getSvc
      .getUserTransaction(this.getSvc.userId, this.thisYear().toString())
      .pipe(
        switchMap((trans: Transaction[]) => {
          let totalIncome = 0;
          let totalExpense = 0;
          trans.map((tran) => {
            if (tran.type === 'income') {
              totalIncome += tran.amount;
            } else {
              totalExpense += tran.amount;
            }
          });
          this.savingsValue.set(totalIncome - totalExpense);
          return of(trans);
        })
      )
      .subscribe(() => {
        console.log(this.stocksValue());
      });

    this.getSvc
      .getUserMortgagePortfolio(this.getSvc.userId)
      .subscribe((res) => {
        this.mortgageNumber.set(res.length);
      });
  }

  dismissNotifcation(i: number) {
    this.notificationMessages.splice(i, 1);
    const oriNotificationAmount: number = parseInt(
      this.notificationAmount(),
      10
    );
    const newAmount: number = oriNotificationAmount - 1;
    this.notificationAmount.set(newAmount.toString());
  }

  clearAllNotifications() {
    this.notificationAmount.set('0');
    this.notificationMessages = [];
  }
}
