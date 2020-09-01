import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FavoritePostComponent } from './favorite-post/favorite-post.component';
import { PeriodComponent } from './period/period.component';
import { TrafficComponent } from './traffic/traffic.component';
import { VisitorPageviewomponent } from './visitor-pageview/visitor-pageview.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'statistic',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Statistic'
    },
    children: [
      {
        path: 'favorite-post',
        component: FavoritePostComponent,
        data: {
          title: 'Favorite post'
        }
      },
      {
        path: 'period',
        component: PeriodComponent,
        data: {
          title: 'period'
        }
      },
      {
        path: 'traffic',
        component: TrafficComponent,
        data: {
          title: 'traffic'
        }
      },
      {
        path: 'visitor-pageview',
        component: VisitorPageviewomponent,
        data: {
          title: 'Visitor & pageview'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticRoutingModule { }
