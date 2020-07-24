import { NgModule } from '@angular/core';
import { AccountingPipe } from './accounting/accounting';
import { LoopPipe } from './loop/loop';
import { BillFilterPipe } from './bill-filter/bill-filter';
import { UtcDatePipe } from './utc-date/utcDate';
import { PhonePipe } from './phone/phone';
import { NumberPipe } from './NumberPipe/NumberPipe'
@NgModule({
  declarations: [
    AccountingPipe,
    LoopPipe, 
    BillFilterPipe, 
    UtcDatePipe, 
    PhonePipe, 
    NumberPipe
  ],
  imports: [],
  exports: [
    AccountingPipe,
    LoopPipe, 
    BillFilterPipe, 
    UtcDatePipe, 
    PhonePipe, 
    NumberPipe
  ]
})
export class PipesModule {
  static forRoot() {
    return {
      ngModule: PipesModule,
      providers: [],
    };
  }
}
