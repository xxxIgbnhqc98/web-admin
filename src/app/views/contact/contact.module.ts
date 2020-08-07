import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { ContactRoutingModule } from './contact-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { CustomFormsModule } from 'ng2-validation'

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
    ContactRoutingModule,
    NgMultiSelectDropDownModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    CustomFormsModule

  ],
  declarations: [ContactListComponent, InquiryListComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class ContactModule { }
