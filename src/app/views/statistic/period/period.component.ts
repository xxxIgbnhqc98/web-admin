import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
declare let swal: any;
import * as moment from "moment";
import { ConfigService } from '../../../services/config/config.service';
import { NgxSpinnerService } from "ngx-spinner";


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
  years: any = [];
  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  //chart

  constructor(
    private router: Router,
    public apiService: ApiService,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private configService: ConfigService,
    private spinner: NgxSpinnerService
  ) {

  }

  async ngOnInit() {
    const start = 2020
    for (let i = start; i < moment().year() + 10; i++) {
      this.years.push(i)
    }
    this.getStatisticPeriod();
  }

  jsUcfirst(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  }

  async getStatisticPeriod() {
    const time = this.year.toString() + "-" + this.month.toString() + "-01"
    const startOfMonth = moment(time).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(time).endOf('month').format('YYYY-MM-DD');
    try {
      const body: any = {
        type: this.type,
        type_of_month: this.type_of_month,
        year: this.year,
        value_of_day: {
          from_date: startOfMonth,
          to_date: endOfMonth,

        }
      };
      this.spinner.show();

      const res: any = await this.apiService.statistic.getStatisticPeriod(body);
      console.log('bambi log coi thu cai res ne', res);
      const statistic = [...res];
      this.listStatisticPeriod = statistic
      let total: any = {
        "index": this.listStatisticPeriod.length + 1,
        "time": (this.configService.lang === 'en') ? 'Total'
        : ((this.configService.lang === 'vn') ? 'Tổng' : '총'),
        "page_view_count": 0,
        "visitor_count": 0,
        "new_member_count": 0,
        "partnership_inquiry_count": 0,
        "new_post_count": 0,
        "reply_count": 0,
      };
      for (let i = 0; i < this.listStatisticPeriod.length; i++) {
        total = {
          "index": this.listStatisticPeriod.length + 1,
          "time": (this.configService.lang === 'en') ? 'Total'
          : ((this.configService.lang === 'vn') ? 'Tổng' : '총'),
          "page_view_count": total.page_view_count + this.listStatisticPeriod[i].page_view_count,
          "visitor_count": total.visitor_count + this.listStatisticPeriod[i].visitor_count,
          "new_member_count": total.new_member_count + this.listStatisticPeriod[i].new_member_count,
          "partnership_inquiry_count": total.partnership_inquiry_count + this.listStatisticPeriod[i].partnership_inquiry_count,
          "new_post_count": total.new_post_count + this.listStatisticPeriod[i].new_post_count,
          "reply_count": total.reply_count + this.listStatisticPeriod[i].reply_count,
        }
      }
      this.listStatisticPeriod.push(total)
      this.spinner.hide();

      console.log("@@#### ", this.listStatisticPeriod[this.listStatisticPeriod.length])
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
