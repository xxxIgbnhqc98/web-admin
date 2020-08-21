import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HowToUseComponent } from './how-to-use/how-to-use.component';
import { PolicyComponent } from './policy/policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { LocationBasedServicesComponent } from './location-based-services/location-based-services.component';
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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardRoutingModule { }
