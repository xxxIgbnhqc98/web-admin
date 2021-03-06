import { NgModule } from '@angular/core';
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
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { LevelHistoryComponent } from './level-history/level-history.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



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
    NgMultiSelectDropDownModule,
    ClipboardModule,
    UsersRoutingModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    BsDatepickerModule.forRoot(),

  ],
  declarations: [LevelHistoryComponent, UserListComponent, AddUserComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class UsersModule { }
