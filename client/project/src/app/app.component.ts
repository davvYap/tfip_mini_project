import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  WritableSignal,
  signal,
} from '@angular/core';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { ThemeService } from './service/theme.service';
import { GetService } from './service/get.service';
import { Router } from '@angular/router';
import { LoginStatus } from './models';
import { PostService } from './service/post.service';
import { Subscription } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import {
  faRightToBracket,
  faGem,
  IconDefinition,
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
  premiumIcon: IconDefinition = faGem;
  items!: MenuItem[];
  imgSrc!: string;
  updateUsersStockValue$!: Subscription;
  dialogRef!: DynamicDialogRef;
  isLogin: WritableSignal<boolean> = signal(false);

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

  constructor(
    private primengConfig: PrimeNGConfig,
    private themeSvc: ThemeService,
    private getSvc: GetService,
    private postSvc: PostService,
    private router: Router,
    private messageSvc: MessageService,
    private dialogSvc: DialogService,
    private renderer: Renderer2,
    private el: ElementRef
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
      } else {
        this.imgSrc = '';
        this.isLogin.set(false);
      }
    });
  }

  getMenuItem(isLogin: boolean): MenuItem[] {
    if (isLogin) {
      return [
        {
          label: 'Investment',
          icon: 'pi pi-fw pi-dollar',
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
              label: 'Check Login',
              icon: 'pi pi-fw pi-user-plus',
              command: () => this.checkLoginStatus(),
            },
            {
              label: 'Setting',
              icon: 'pi pi pi-spin pi-cog',
              items: [
                {
                  label: 'Filter',
                  icon: 'pi pi-fw pi-filter',
                  items: [
                    {
                      label: 'Print',
                      icon: 'pi pi-fw pi-print',
                    },
                  ],
                },
                {
                  icon: 'pi pi-fw pi-bars',
                  label: 'List',
                },
              ],
            },
          ],
        },
        {
          label: 'Events',
          icon: 'pi pi-fw pi-calendar',
          items: [
            {
              label: 'Edit',
              icon: 'pi pi-fw pi-pencil',
              items: [
                {
                  label: 'Save',
                  icon: 'pi pi-fw pi-calendar-plus',
                },
                {
                  label: 'Delete',
                  icon: 'pi pi-fw pi-calendar-minus',
                },
              ],
            },
            {
              label: 'Archieve',
              icon: 'pi pi-fw pi-calendar-times',
              items: [
                {
                  label: 'Remove',
                  icon: 'pi pi-fw pi-calendar-minus',
                },
              ],
            },
          ],
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-desktop',
          routerLink: '/dashboard',
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
    this.changeTheme(0);
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
    });

    this.dialogRef.onClose.subscribe();
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
}
