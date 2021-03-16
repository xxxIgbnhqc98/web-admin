import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { BulletinComponent } from './bulletin/bulletin-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { BulletinRoutingModule } from './bulletin-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommentListComponent } from './comment-post-list/comment-post-list.component';
import { RecruitComponent } from './recruit/recruit-list.component';
import { ReportListComponent } from './report-list/report-list.component';


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
    BulletinRoutingModule,
    NgMultiSelectDropDownModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule
  ],
  declarations: [ReportListComponent, CommentListComponent, BulletinComponent, RecruitComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class BulletinModule { }
