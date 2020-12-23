import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { SettingListComponent } from './setting-list/setting-list.component';
import { SettingUserPermissionListComponent } from './setting-user-permission-list/setting-user-permission-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { SettingRoutingModule } from './setting-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { AddLinkComponent } from './add/add.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ForbiddenWordListComponent } from './forbidden-word-list/forbidden-word-list.component';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PipesModule.forRoot(),
    CommonModule,
    DataTableModule,
    LaddaModule,
    LazyLoadImagesModule,
    SharedModule,
    ClipboardModule,
    SettingRoutingModule,
    NgMultiSelectDropDownModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    ColorPickerModule,


  ],
  declarations: [SettingListComponent, AddLinkComponent, SettingUserPermissionListComponent, ForbiddenWordListComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class SettingModule { }
