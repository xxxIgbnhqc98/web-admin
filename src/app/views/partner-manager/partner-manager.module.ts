import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartnerManagerComponent } from './partner-manager.component';
import { PartnerManagerRoutingModule } from './partner-manager-routing.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CommonModule } from '@angular/common';
import { DataTableModule } from '../../shared/data-table';
import { LaddaModule } from 'angular2-ladda';
import { AddPartnerManagerComponent } from './add/add.component';
import { ExcelService } from '../../services/excel/excel.service';
import { SharedModule } from './../../shared';

@NgModule({
  imports: [
    FormsModule,
    PartnerManagerRoutingModule,
    PipesModule.forRoot(),
    CommonModule,
    DataTableModule,
    LaddaModule,
    SharedModule
  ],
  declarations: [ PartnerManagerComponent, AddPartnerManagerComponent ],
  providers: [
    ExcelService
  ]
})
export class PartnerManagerModule { }
