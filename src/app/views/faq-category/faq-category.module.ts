import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { FaqCategoryListComponent } from './faq-category-list/faq-category-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { FaqCategoryRoutingModule } from './faq-category-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { AddFaqCategoryComponent } from './add/add.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


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
    FaqCategoryRoutingModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    NgMultiSelectDropDownModule

  ],
  declarations: [FaqCategoryListComponent, AddFaqCategoryComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class FaqCategoryModule { }
