import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { CategoryListComponent } from './category-list/category-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { CategoryRoutingModule } from './category-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { AddCategoryComponent } from './add/add.component';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  imports: [
    FormsModule,
    PipesModule.forRoot(),
    CommonModule,
    DataTableModule,
    LaddaModule,
    LazyLoadImagesModule,
    SharedModule,
    ClipboardModule,
    CategoryRoutingModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    ColorPickerModule

  ],
  declarations: [CategoryListComponent, AddCategoryComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class CategoryModule { }
