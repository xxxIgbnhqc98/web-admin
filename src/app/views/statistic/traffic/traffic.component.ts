import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
declare let swal: any;
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-traffic',
  templateUrl: './traffic.component.html',
  styleUrls: ['./traffic.component.scss']
})
export class TrafficComponent implements OnInit {
  listStatisticTraffic: any = [];
  listStatisticTrafficOfMonth: any = [];
  month: number = 0;
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
    private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {

  }

  async ngOnInit() {
    this.getStatisticTraffic();
  }

  jsUcfirst(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  }
  changeType() {
    this.listStatisticTrafficOfMonth = this.listStatisticTraffic[this.month].data
  }
  async getStatisticTraffic() {
    try {
      const body: any = {
        type: this.type,
        type_of_month: this.type_of_month,
        // value_of_day: {
        //   from_date: moment(this.value_of_day[0]).format('YYYY-MM-DD'),
        //   to_date: moment(this.value_of_day[1]).format('YYYY-MM-DD'),

        // }
      };
      this.spinner.show();

      const res: any = await this.apiService.statistic.getStatisticTraffic(body);
      console.log('bambi log coi thu cai res ne', res);
      const statistic = [...res];
      this.listStatisticTraffic = statistic
      // this.listStatisticTraffic = [
      //   {
      //     index: 0,
      //     month: "01/2020",
      //     data: [
      //       {
      //         index: 0,
      //         date: "01/01/2020",
      //         visitor_count: 1
      //       },
      //       {
      //         index: 1,
      //         date: "02/01/2020",
      //         visitor_count: 4
      //       }
      //     ]
      //   },
      //   {
      //     index: 1,
      //     month: "02/2020",
      //     data: [
      //       {
      //         index: 0,
      //         date: "01/02/2020",
      //         visitor_count: 5
      //       },
      //       {
      //         index: 1,
      //         date: "02/02/2020",
      //         visitor_count: 14
      //       }
      //     ]
      //   },
      // ]
      this.listStatisticTrafficOfMonth = this.listStatisticTraffic[this.month].data
      this.spinner.hide();

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
