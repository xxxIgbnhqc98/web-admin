import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { AddCategoryComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'category-list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Category'
    },
    children: [
      {
        path: 'add',
        component: AddCategoryComponent,
        data: {
          title: 'Add new'
        }
      },
      {
        path: ':thema_id/add',
        component: AddCategoryComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddCategoryComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'category-list',
        component: CategoryListComponent,
        data: {
          title: 'Category list'
        }
      },
      {
        path: 'category-list/:thema_id',
        component: CategoryListComponent,
        data: {
          title: 'Category list'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }
