import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationRoutingModule } from './notification-routing.module';
import { DataTableModule } from '../../shared/data-table';
import { CommonModule } from '@angular/common';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { LaddaModule } from 'angular2-ladda';
import { PipesModule } from '../../pipes/pipes.module';
import { PushNotificationSettingsComponent } from './settings/settings.component';
import { SentPushNotificationComponent } from './sent/sent.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from './../../shared';

@NgModule({
  imports: [
    FormsModule,
    NotificationRoutingModule,
    DataTableModule,
    CommonModule,
    LazyLoadImagesModule,
    LaddaModule,
    PipesModule.forRoot(),
    BsDatepickerModule.forRoot(),
    SharedModule
  ],
  declarations: [ PushNotificationSettingsComponent, SentPushNotificationComponent ]
})
export class NotificationModule { }
