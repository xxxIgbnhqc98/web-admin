import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThemaListComponent } from './thema-list/thema-list.component';
import { AddThemaComponent } from './add/add.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'thema-list',
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
        component: AddThemaComponent,
        data: {
          title: 'Add new'
        }
      },
       {
        path: 'add/:id',
        component: AddThemaComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'thema-list',
        component: ThemaListComponent,
        data: {
          title: 'Thema list'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThemaRoutingModule { }
