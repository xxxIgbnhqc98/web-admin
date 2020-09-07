import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SeoListComponent } from './seo/seo.component';
import { AddSeoComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'seo-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Seo'
    },
    children: [
      {
        path: 'add',
        component: AddSeoComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddSeoComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'seo-list',
        component: SeoListComponent,
        data: {
          title: 'Seo list'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeoRoutingModule { }
