import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { ThemeService } from './service/theme.service';
import { GetService } from './service/get.service';
import { NavigationEnd, Router } from '@angular/router';
import { LoginStatus } from './models';
import { PostService } from './service/post.service';
import { RoutePersistenceService } from './service/route-persistence.service';
import { Subscription } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddTransactionComponent } from './component/add-transaction/add-transaction.component';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  loginIcon = faRightToBracket;
  items!: MenuItem[];
  imgSrc!: string;
  updateUsersStockValue$!: Subscription;
  dialogRef!: DynamicDialogRef;
  isLogin: WritableSignal<boolean> = signal(false);

  themes: string[] = [
    'mira',
    'nano',
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
    private routerPerSvc: RoutePersistenceService,
    private messageSvc: MessageService,
    private dialogSvc: DialogService
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
        this.imgSrc = '/assets/images/puzzle.png';
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
                  routerLink: '/investment',
                },
              ],
            },
            {
              label: 'Portfolio',
              icon: 'pi pi-fw pi-chart-line',
              routerLink: '/investment-dashboard',
            },
            {
              separator: true,
            },
            {
              label: 'Update',
              icon: 'pi pi-fw pi-external-link',
              command: () => this.triggerUpdateUsersStockValue(),
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
                  icon: 'pi pi-fw pi-ticket ',
                  command: () => this.newTransaction(),
                },
              ],
            },
            {
              label: 'Records',
              icon: 'pi pi-fw pi-history',
              routerLink: '/transaction-records',
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
                  label: 'MDC Dark',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(2),
                },
                {
                  label: 'Viva Dark',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(3),
                },
                {
                  label: 'Lara Dark Teal',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(4),
                },
                {
                  label: 'Arya Green',
                  icon: 'pi pi-fw pi-images',
                  command: () => this.changeTheme(5),
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
          // routerLink: '/login',
        },
        {
          label: 'Premium',
          icon: 'pi pi-fw pi-lock-open',
        },
        {
          label: 'Contact Us',
          icon: 'pi pi-fw pi-telegram',
        },
      ];
    }
  }

  changeTheme(i: number) {
    let theme = this.themes[i];
    this.themeSvc.switchTheme(theme);
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
    this.router.navigate(['/login']);
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
}
