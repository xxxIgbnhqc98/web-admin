import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingListComponent } from './setting-list/setting-list.component';
import { AddLinkComponent } from './add/add.component';
import { SettingUserPermissionListComponent } from './setting-user-permission-list/setting-user-permission-list.component';
import { ForbiddenWordListComponent } from './forbidden-word-list/forbidden-word-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'setting-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'setting'
    },
    children: [
       {
        path: 'setting-user-permission/:id',
        component: AddLinkComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'setting-list',
        component: SettingListComponent,
        data: {
          title: 'setting list'
        }
      },
      {
        path: 'setting-user-permission-list',
        component: SettingUserPermissionListComponent,
        data: {
          title: 'setting user permission list'
        }
      },
      {
        path: 'forbidden-word-list',
        component: ForbiddenWordListComponent,
        data: {
          title: 'Forbidden word list'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
