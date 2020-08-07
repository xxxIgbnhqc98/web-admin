import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';

import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { UserChangePasswordComponent } from './views/user-change-password/user-change-password.component';
import { AuthGuard } from './services/guards/auth.guard';
import { ToolBoxComponent } from './views/tool-box/tool-box.component';
import { PolicyComponent } from './views/policy/policy.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'tool-box',
    component: ToolBoxComponent,
    data: {
      title: 'tool box'
    }
  },
  {
    path: 'policy',
    component: PolicyComponent,
    data: {
      title: 'Policy'
    }
  },
  {
    path: 'user-change-password',
    component: UserChangePasswordComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Kor'
    },
    children: [
      {
        path: 'partner-manager',
        loadChildren: './views/partner-manager/partner-manager.module#PartnerManagerModule'
      },
      {
        path: 'users',
        loadChildren: './views/users/users.module#UsersModule'
      },
      {
        path: 'thema',
        loadChildren: './views/thema/thema.module#ThemaModule'
      },
      {
        path: 'category',
        loadChildren: './views/category/category.module#CategoryModule'
      },
      {
        path: 'shop',
        loadChildren: './views/shop/shop.module#ShopModule'
      },
      {
        path: 'link',
        loadChildren: './views/link/link.module#LinkModule'
      },
      {
        path: 'contact',
        loadChildren: './views/contact/contact.module#ContactModule'
      },
      {
        path: 'banner',
        loadChildren: './views/banner/banner.module#BannerModule'
      },
      {
        path: 'notification',
        loadChildren: './views/notification/notification.module#NotificationModule'
      },
      {
        path: 'setting',
        loadChildren: './views/setting/setting.module#SettingModule'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
