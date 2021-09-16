import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardRoutingModule } from './board-routing.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule } from '@angular/common';
import { LaddaModule } from 'angular2-ladda';
import { QuillModule } from 'ngx-quill';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { HowToUseComponent } from './how-to-use/how-to-use.component';
import { SharedModule } from './../../shared';
import { PolicyComponent } from './policy/policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { LocationBasedServicesComponent } from './location-based-services/location-based-services.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { JumpUpPageComponent } from './jump-up-page/jump-up-page.component';
import { LevelPageComponent } from './level-page/level-page.component';
import { EventPageComponent } from './event-page/event-page.component';
import { ShopPageTutorialComponent } from './shop-page-tutorial/shop-page-tutorial.component';
import { RecruitTutorialPageComponent } from './recruit-tutorial-page/recruit-tutorial-page.component';
import { CourseTutorialPageComponent } from './course-tutorial-page/course-tutorial-page.component';

@NgModule({
  imports: [
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    FormsModule,
    BoardRoutingModule,
    PipesModule.forRoot(),
    CommonModule,
    LaddaModule,
    QuillModule,
    TabsModule.forRoot(),
    SharedModule
  ],
  declarations: [CourseTutorialPageComponent, RecruitTutorialPageComponent, ShopPageTutorialComponent, EventPageComponent, LevelPageComponent, HowToUseComponent, JumpUpPageComponent, CompanyInfoComponent, PolicyComponent, TermsOfServiceComponent, LocationBasedServicesComponent],
  providers: [

  ]
})
export class BoardModule { }
