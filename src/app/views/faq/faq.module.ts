import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { FaqListComponent } from './faq-list/faq-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { FaqRoutingModule } from './faq-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { AddFaqComponent } from './add/add.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';


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
    FaqRoutingModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    NgMultiSelectDropDownModule,
    FroalaEditorModule,
    FroalaViewModule

  ],
  declarations: [FaqListComponent, AddFaqComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class FaqModule { }
