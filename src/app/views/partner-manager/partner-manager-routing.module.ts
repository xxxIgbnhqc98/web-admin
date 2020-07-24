import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartnerManagerComponent } from './partner-manager.component';
import { AddPartnerManagerComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Partner manager & Admin'
    },
    children: [
      {
        path: 'add',
        component: AddPartnerManagerComponent,
        data: {
          title: 'Add new'
        }
      }, {
        path: 'add/:id',
        component: AddPartnerManagerComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'list',
        component: PartnerManagerComponent,
        data: {
          title: 'List'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartnerManagerRoutingModule { }
