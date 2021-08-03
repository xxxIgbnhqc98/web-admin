import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FaqCategoryListComponent } from './faq-category-list/faq-category-list.component';
import { AddFaqCategoryComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'faq-category',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'FAQ category'
    },
    children: [
      {
        path: 'add',
        component: AddFaqCategoryComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddFaqCategoryComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'faq-category-list',
        component: FaqCategoryListComponent,
        data: {
          title: 'List'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaqCategoryRoutingModule { }
