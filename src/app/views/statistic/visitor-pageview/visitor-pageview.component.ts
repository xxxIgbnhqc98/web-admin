import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
declare let swal: any;
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-visitor-pageview',
  templateUrl: './visitor-pageview.component.html',
  styleUrls: ['./visitor-pageview.component.scss']
})
export class VisitorPageviewomponent implements OnInit {
  listStatisticDaily: any = [];
  listStatisticAverage: any = [];

  page: number = 1;
  type: string = 'visitor';
  value_of_day: Date = new Date();
  currentDate: Date = new Date();
  area_type: string;
  month: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  years: any = [];
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
    const start = 2020
    for (let i = start; i < moment().year() + 10; i++) {
      this.years.push(i)
    }
    this.getStatisticVisitorViewPage();
    this.getStatisticAverageVisitor();
  }

  jsUcfirst(string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  }

  async getStatisticVisitorViewPage() {
    const time = this.year.toString() + "-" + this.month.toString() + "-01"
    const startOfMonth = moment(time).startOf('month').startOf('week').format('YYYY-MM-DD');
    const endOfMonth = moment(time).endOf('month').endOf('week').format('YYYY-MM-DD');

    console.log("@!$#@$ ", endOfMonth)
    try {
      let area_type = "daily_visitor"
      if (this.type === "page_view") {
        area_type = "daily_pageview"
      }
      const body: any = {
        type: "day",
        area_type: area_type,
        value_of_day: {
          "from_date": startOfMonth,
          "to_date": endOfMonth
        }
      };
      this.spinner.show();

      const res: any = await this.apiService.statistic.getStatisticVisitorViewPage(body);
      console.log('bambi log coi thu cai res ne', res);
      const statistic = [...res];
      this.listStatisticDaily = statistic
      this.spinner.hide();

      console.log("#@$#%#$% ", this.listStatisticDaily.length)
    } catch (err) {
      console.log('err: ', err);
    }
  }
  checkInMonth(month){
    console.log("@@@@@ ",this.month)
    
    if(parseInt(this.month.toString()) === parseInt(month.substring(0,2))){
      return true
    }else{
      return false
    }
  }
  async getStatisticAverageVisitor() {
    try {
      let area_type = "average_visitor"
      if (this.type === "page_view") {
        area_type = "average_pageview"
      }
      const body: any = {
        type: "day",
        area_type: area_type
      };
      const res: any = await this.apiService.statistic.getStatisticVisitorViewPage(body);
      console.log('bambi log coi thu cai res ne', res);
      const statistic = [...res];
      const data12M = []
      for (let m = 1; m <= 12; m++) {
        data12M.push(
          {
            "month": m,
            "number": 0,
            "average": 0
          }
        )
      }
      for (let i = 0; i < statistic.length; i++) {
        for (let m = 0; m < statistic[i].data.length; m++) {
          data12M[statistic[i].data[m].month - 1] = statistic[i].data[m]
        }
        statistic[i].data = data12M
      }
      this.listStatisticAverage = statistic

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
