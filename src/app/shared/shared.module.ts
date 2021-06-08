import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';
import { NgxSpinnerModule } from "ngx-spinner";


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBZ5JagkSX0aqgaWuE7zPH7EN5NXYy3UfQ',
      libraries: ['places']
    })
  ],
  declarations: [
  ],
  exports: [
    RouterModule,
    TranslateModule,
    AgmCoreModule,
    NgxSpinnerModule
  ]
})
export class SharedModule { }
