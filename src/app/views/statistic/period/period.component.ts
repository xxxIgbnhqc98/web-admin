import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
declare let swal: any;
import * as moment from "moment";

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit {
  listStatisticPeriod: any = [];
  page: number = 1;
  type: string = 'month';
  type_of_month: string = '12_month';
  value_of_day: Date = new Date();
  currentDate: Date = new Date();

  //chart

  constructor(
    private router: Router,
    public apiService: ApiService,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef
  ) {

  }

  async ngOnInit() {
    this.getStatisticPeriod();
  }

  jsUcfirst(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  }

  async getStatisticPeriod() {
    try {
      const body:any = {
        type: this.type,
        type_of_month: this.type_of_month,
        // value_of_day: {
        //   from_date: moment(this.value_of_day[0]).format('YYYY-MM-DD'),
        //   to_date: moment(this.value_of_day[1]).format('YYYY-MM-DD'),

        // }
      };
      if(this.value_of_day[1]){
        console.log("#$$@#$ ",moment(this.value_of_day[0]).format('YYYY-MM-DD'))
        body.value_of_day = {
          from_date: moment(this.value_of_day[0]).format('YYYY-MM-DD'),
          to_date: moment(this.value_of_day[1]).format('YYYY-MM-DD'),
        }
      }
      const res: any = await this.apiService.statistic.getStatisticPeriod(body);
      console.log('bambi log coi thu cai res ne', res);
      const statistic = [...res];
      this.listStatisticPeriod = statistic
    } catch (err) {
      console.log('err: ', err);
    }
  }
  alertSearchApp() {
    return swal({
      title: 'This feature is in development',
      type: 'info',
      timer: 3000,
    });
  }
  alertNotValidFromToDay() {
    swal({
      title: 'Please choose a valid date (only use a date before the current day)',
      type: 'warning',
    });
  }
}
