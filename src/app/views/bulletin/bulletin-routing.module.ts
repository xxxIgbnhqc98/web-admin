import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BulletinComponent } from './bulletin/bulletin-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'bulletin',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Bulletin'
    },
    children: [
      // {
      //   path: 'add',
      //   component: AddLinkComponent,
      //   data: {
      //     title: 'Add new'
      //   }
      // },
      //  {
      //   path: 'add/:id',
      //   component: AddLinkComponent,
      //   data: {
      //     title: 'Edit'
      //   }
      // },
      {
        path: 'bulletin',
        component: BulletinComponent,
        data: {
          title: 'Bulletin'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BulletinRoutingModule { }
