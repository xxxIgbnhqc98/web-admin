import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AddUserComponent } from './add/add.component';
import { LevelHistoryComponent } from './level-history/level-history.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'user-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Users'
    },
    children: [
      {
        path: 'add',
        component: AddUserComponent,
        data: {
          title: 'Add new'
        }
      },
      {
        path: 'add/:id',
        component: AddUserComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'user-list',
        component: UserListComponent,
        data: {
          title: 'User list'
        }
      },
      {
        path: 'level-history',
        component: LevelHistoryComponent,
        data: {
          title: 'Level history'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
