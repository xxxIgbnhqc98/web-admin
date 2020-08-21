import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShopListComponent } from './shop-list/shop-list.component';
import { AddShopComponent } from './add/add.component';
import { ShopPendingListComponent } from './shop-pending-list/shop-pending-list.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { ShopBannerListComponent } from './shop-banner-list/shop-banner-list.component';
import { recommendationAreaListComponent } from './recommendation-area/recommendation-area-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'shop-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Shop'
    },
    children: [
      {
        path: 'add',
        component: AddShopComponent,
        data: {
          title: 'Add new'
        }
      },
      {
        path: ':thema_id/add',
        component: AddShopComponent,
        data: {
          title: 'Add new'
        }
      },
      {
        path: 'edit-banner/:thema_id',
        component: ShopBannerListComponent,
        data: {
          title: 'Edit banner'
        }
      },
      {
        path: 'add/:id',
        component: AddShopComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'shop-list',
        component: ShopListComponent,
        data: {
          title: 'shop list'
        }
      },
      {
        path: 'tag-list',
        component: TagListComponent,
        data: {
          title: 'tag list'
        }
      },
      {
        path: 'shop-list/:category_id',
        component: ShopListComponent,
        data: {
          title: 'shop list'
        }
      },
      {
        path: 'shop-pending-list',
        component: ShopPendingListComponent,
        data: {
          title: 'shop pending list'
        }
      },
      {
        path: 'recommendation-area',
        component: recommendationAreaListComponent,
        data: {
          title: 'Recommendation area'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
