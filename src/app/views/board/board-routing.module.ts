import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HowToUseComponent } from './how-to-use/how-to-use.component';
import { PolicyComponent } from './policy/policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { LocationBasedServicesComponent } from './location-based-services/location-based-services.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { JumpUpPageComponent } from './jump-up-page/jump-up-page.component';
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
