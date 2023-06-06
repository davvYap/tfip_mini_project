import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { ThemeService } from './service/theme.service';
import { GetService } from './service/get.service';
import { NavigationEnd, Router } from '@angular/router';
import { LoginStatus } from './models';
import { PostService } from './service/post.service';
import { RoutePersistenceService } from './service/route-persistence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  items!: MenuItem[];

  themes: string[] = ['mira', 'mdc-dark-deeppurple', 'viva-dark'];

  constructor(
    private primengConfig: PrimeNGConfig,
    private themeSvc: ThemeService,
    private getSvc: GetService,
    private postSvc: PostService,
    private router: Router,
    private routerPerSvc: RoutePersistenceService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    this.primengConfig.zIndex = {
      modal: 1100, // dialog, sidebar
      overlay: 1000, // dropdown, overlaypanel
      menu: 1000, // overlay menus
      tooltip: 1100, // tooltip
    };

    //IMPORTANT To prevent refresh page routes to login page
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.routerPerSvc.saveCurrentRoute(event.url);
      }
    });

    this.items = [
      {
        label: 'File',
        icon: 'pi pi-fw pi-file',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-plus',
            items: [
              {
                label: 'Investment',
                icon: 'pi pi-fw pi-bitcoin',
                routerLink: '/investment',
              },
              {
                label: 'Video',
                icon: 'pi pi-fw pi-video',
              },
            ],
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
          },
          {
            separator: true,
          },
          {
            label: 'Export',
            icon: 'pi pi-fw pi-external-link',
          },
        ],
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        items: [
          {
            label: 'Mira',
            icon: 'pi pi-fw pi-align-left',
            command: () => this.changeTheme(0),
          },
          {
            label: 'MDC Dark',
            icon: 'pi pi-fw pi-align-right',
            command: () => this.changeTheme(1),
          },
          {
            label: 'Viva Dark',
            icon: 'pi pi-fw pi-align-center',
            command: () => this.changeTheme(2),
          },
          {
            label: 'Justify',
            icon: 'pi pi-fw pi-align-justify',
          },
        ],
      },
      {
        label: 'Users',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-user-plus',
            command: () => this.checkLoginStatus(),
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-user-minus',
          },
          {
            label: 'Search',
            icon: 'pi pi-fw pi-users',
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
      {
        label: 'Quit',
        icon: 'pi pi-fw pi-power-off',
        command: () => this.logout(),
        // routerLink: '/login',
      },
    ];
  }

  changeTheme(i: number) {
    let theme = this.themes[i];
    this.themeSvc.switchTheme(theme);
    let userId = this.getSvc.userId;
    this.postSvc.updateUserTheme(userId, theme);
  }

  logout() {
    this.getSvc.isLogin = false;
    this.getSvc.logout();
    this.router.navigate(['/login']);
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
}
