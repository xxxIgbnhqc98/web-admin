import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BulletinComponent } from './bulletin/bulletin-list.component';
import { CommentListComponent } from './comment-post-list/comment-post-list.component';
import { RecruitComponent } from './recruit/recruit-list.component';
import { ReportListComponent } from './report-list/report-list.component';

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
      {
        path: 'recruit',
        component: RecruitComponent,
        data: {
          title: 'Recruit'
        }
      },
      {
        path: 'comment',
        component: CommentListComponent,
        data: {
          title: 'Comment'
        }
      },
      {
        path: 'report',
        component: ReportListComponent,
        data: {
          title: 'Report'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BulletinRoutingModule { }
