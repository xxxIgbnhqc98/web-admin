import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MetaListComponent } from './meta-list/meta-list.component';
import { AddMetaComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'meta-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Meta'
    },
    children: [
      {
        path: 'add',
        component: AddMetaComponent,
        data: {
          title: 'Add new'
        }
      },
      {
        path: ':seo_id/add',
        component: AddMetaComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddMetaComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'meta-list',
        component: MetaListComponent,
        data: {
          title: 'Meta list'
        }
      },
      {
        path: 'meta-list/:seo_id',
        component: MetaListComponent,
        data: {
          title: 'Meta list'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MetaRoutingModule { }
