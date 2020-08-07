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
      title: 'Inquiry'
    },
    children: [
      {
        path: 'contact-list',
        component: ContactListComponent,
        data: {
          title: 'Contact us'
        }
      },
      {
        path: 'partnership-list',
        component: InquiryListComponent,
        data: {
          title: 'Partnership'
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
