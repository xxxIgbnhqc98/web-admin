import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { ShopListComponent } from './shop-list/shop-list.component';
import { ShopPendingListComponent } from './shop-pending-list/shop-pending-list.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { ShopRoutingModule } from './shop-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { AddShopComponent } from './add/add.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { QuillModule } from 'ngx-quill';
import { TagListComponent } from './tag-list/tag-list.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
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
    ShopRoutingModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    NgMultiSelectDropDownModule,
    QuillModule,
    BsDatepickerModule.forRoot(),
    ColorPickerModule
  ],
  declarations: [ShopListComponent, TagListComponent, ShopPendingListComponent, AddShopComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class ShopModule { }
