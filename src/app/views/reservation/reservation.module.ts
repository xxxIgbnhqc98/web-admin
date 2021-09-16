import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { ExcelService } from '../../services/excel/excel.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { ReservationRoutingModule } from './reservation-routing.module';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { SharedModule } from '../../shared';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReservationComponent } from './reservation-list/reservation-list.component';
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
    ReservationRoutingModule,
    NgMultiSelectDropDownModule,
    ModalModule.forRoot(),
    NgxInfiniteScrollerModule,
    CustomFormsModule

  ],
  declarations: [ReservationComponent],
  providers: [
    ExcelService,
    DatePipe
  ]
})
export class ReservationModule { }
