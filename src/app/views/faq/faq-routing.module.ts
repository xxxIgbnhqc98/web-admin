import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FaqListComponent } from './faq-list/faq-list.component';
import { AddFaqComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'faq-category',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Thema'
    },
    children: [
      {
        path: 'add',
        component: AddFaqComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddFaqComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'faq-category-list',
        component: FaqListComponent,
        data: {
          title: 'Thema list'
        }
      },
      {
        path: ':faq_category_id/add',
        component: AddFaqComponent,
        data: {
          title: 'Add new'
        }
      },
      {
        path: 'faq-list/:faq_category_id',
        component: FaqListComponent,
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
export class FaqRoutingModule { }
