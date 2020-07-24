import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LinkListComponent } from './link-list/link-list.component';
import { AddLinkComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'link-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Link'
    },
    children: [
      {
        path: 'add',
        component: AddLinkComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddLinkComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'link-list',
        component: LinkListComponent,
        data: {
          title: 'Link list'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkRoutingModule { }
