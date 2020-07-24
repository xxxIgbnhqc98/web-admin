import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { ThemaListComponent } from './thema-list/thema-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { ThemaRoutingModule } from './thema-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from './../../shared';
import { AddThemaComponent } from './add/add.component';


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
    ThemaRoutingModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,

  ],
  declarations: [ThemaListComponent, AddThemaComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class ThemaModule { }
