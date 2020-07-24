import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { UserListComponent } from './user-list/user-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { UsersRoutingModule } from './users-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from './../../shared';
import { AddUserComponent } from './add/add.component';


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
    UsersRoutingModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,

  ],
  declarations: [UserListComponent, AddUserComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class UsersModule { }
