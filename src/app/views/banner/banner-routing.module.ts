import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BannerListComponent } from './banner-list/banner-list.component';
import { AddBannerComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'link-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Banner'
    },
    children: [
      {
        path: 'add',
        component: AddBannerComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddBannerComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'banner-list',
        component: BannerListComponent,
        data: {
          title: 'Banner list'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BannerRoutingModule { }
