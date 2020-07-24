import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
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
    AgmCoreModule
  ]
})
export class SharedModule { }
