import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactListComponent } from './contact-list/contact-list.component';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'contact',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Contact'
    },
    children: [
      {
        path: 'contact-list',
        component: ContactListComponent,
        data: {
          title: 'Contact list'
        }
      },
      {
        path: 'inquiry-list',
        component: InquiryListComponent,
        data: {
          title: 'Partnership inquiry list'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
