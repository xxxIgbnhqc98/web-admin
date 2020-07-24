import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AddUserComponent } from './add/add.component';

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
      // {
      //   path: 'add',
      //   component: AddUserComponent,
      //   data: {
      //     title: 'Add new'
      //   }
      // },
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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
