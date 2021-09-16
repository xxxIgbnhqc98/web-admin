import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReservationComponent } from './reservation-list/reservation-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'reservation',
    pathMatch: 'full',
  },
  {
    path: '',
    component: ReservationComponent,
    data: {
      title: 'Reservation list'
    },
    // children: [
    //   {
    //     path: 'reservation-list',
    //     component: ReservationComponent,
    //     data: {
    //       title: 'Reservation list'
    //     }
    //   },
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationRoutingModule { }
