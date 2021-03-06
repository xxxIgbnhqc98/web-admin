import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HowToUseComponent } from './how-to-use/how-to-use.component';
import { PolicyComponent } from './policy/policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { LocationBasedServicesComponent } from './location-based-services/location-based-services.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { JumpUpPageComponent } from './jump-up-page/jump-up-page.component';
import { LevelPageComponent } from './level-page/level-page.component';
import { EventPageComponent } from './event-page/event-page.component';
import { ShopPageTutorialComponent } from './shop-page-tutorial/shop-page-tutorial.component';
import { RecruitTutorialPageComponent } from './recruit-tutorial-page/recruit-tutorial-page.component';
import { CourseTutorialPageComponent } from './course-tutorial-page/course-tutorial-page.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: '',
    data: {
      title: 'Board'
    },
    children: [
      {
        path: 'how-to-use',
        component: HowToUseComponent,
        data: {
          title: 'How to use'
        }
      },
      {
        path: 'policy',
        component: PolicyComponent,
        data: {
          title: 'Policy'
        }
      },
      {
        path: 'terms-of-service',
        component: TermsOfServiceComponent,
        data: {
          title: 'Terms of service'
        }
      },
      {
        path: 'location-based-services',
        component: LocationBasedServicesComponent,
        data: {
          title: 'Location based services'
        }
      },
      {
        path: 'company-info',
        component: CompanyInfoComponent,
        data: {
          title: 'Company info'
        }
      },
      {
        path: 'jump-up-page',
        component: JumpUpPageComponent,
        data: {
          title: 'Jump-up page'
        }
      },
      {
        path: 'level-page',
        component: LevelPageComponent,
        data: {
          title: 'Level page'
        }
      },
      {
        path: 'event-page',
        component: EventPageComponent,
        data: {
          title: 'Level page'
        }
      },
      {
        path: 'shop-page-tutorial',
        component: ShopPageTutorialComponent,
        data: {
          title: 'Shop tutorial page'
        }
      },
      {
        path: 'recruit-tutorial-page',
        component: RecruitTutorialPageComponent,
        data: {
          title: 'Recruit tutorial page'
        }
      },
      {
        path: 'course-tutorial-page',
        component: CourseTutorialPageComponent,
        data: {
          title: 'Course tutorial page'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
