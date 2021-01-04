import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { ConfigService } from '../../../services/config/config.service';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { throws } from 'assert';

declare let swal: any;

@Component({
  templateUrl: 'settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class PushNotificationSettingsComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { 'user': ['$all'] }, { 'employee': ['$all'] }];
  query: any = {};
  queryExport: any = {};
  searchTimeOut: number = 250;
  searchRef: any;
  decodeUrl: boolean = false;
  submitting: boolean = false;
  title: string = null;
  date: Date = new Date();
  time: any = new Date().getHours() + ':59';
  message_title: string = null;
  message_content: string = null;
  sending_type: string = 'GROUP';
  paid_type: string = 'ALL';
  frequency: string = 'ONE_TIME';
  user_type: string = null;
  sex: string = null;
  nationality: string = null;

  @ViewChild('itemsTable') itemsTable: DataTable;
  constructor(
    public apiService: ApiService,
    private ref: ChangeDetectorRef,
    private configService: ConfigService) {
  }

  ngOnInit() {
  }

  alertSearchApp() {
    return swal({
      title: 'This feature is in development',
      type: 'info',
      timer: 3000,
    });
  }

  async addNotification(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.addNotificationImpl(form);
    } else {
      this.alertPleaseCheckYourInput();
      this.submitting = false;
    }
  }
  checkDate() {
    let hour = 0;
    let minute = 0;
    if (this.time.split(':').length > 0) {
      hour = this.time.split(':')[0];
    }
    if (this.time.split(':').length > 1) {
      minute = this.time.split(':')[1];
    }

    const sending_unix_timestamp = new Date(this.date.getFullYear(), this.date.getMonth(),
      this.date.getDate(), hour, minute, 0).getTime();
    if (sending_unix_timestamp < new Date().getTime()) {
      this.time = new Date().getHours() + ':59';
      this.date = new Date();
      this.alertPleaseCheckYourTime();

    }
    console.log("@#@3 ", this.time)
  }

  async addNotificationImpl(form: NgForm) {
    try {
      let hour = 0;
      let minute = 0;
      if (this.time.split(':').length > 0) {
        hour = this.time.split(':')[0];
      }
      if (this.time.split(':').length > 1) {
        minute = this.time.split(':')[1];
      }
      const sending_unix_timestamp = new Date(this.date.getFullYear(), this.date.getMonth(),
        this.date.getDate(), hour, minute, 0).getTime();
      const body = {
        title: this.title,
        message_title: this.message_title,
        message_content: this.message_content,
        frequency: this.frequency,
        status: 1,
        paid_type: this.paid_type,
        type: this.sending_type,
        sending_unix_timestamp: sending_unix_timestamp,
        user_type: this.user_type,
        sex: this.sex,
        nationality: this.nationality
      };
      await this.apiService.pushNotification.add(body);
      this.submitting = false;
      form.reset();
      this.alertSuccess();
      setTimeout(() => {
        this.time = '12:00';
        this.sending_type = 'GROUP';
        this.frequency = 'ONE_TIME';
      }, 500);
    } catch (error) {
      this.alertError(error.error.message);
      this.submitting = false;
    }
  }

  changeFrequency(event: any) {
    this.frequency = event.srcElement.value;
  }

  alertPleaseCheckYourInput() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
  }
  alertPleaseCheckYourTime() {
    return swal({
      title: (this.configService.lang === 'en') ? 'You can not create noti reservation with past schedule' : ((this.configService.lang === 'vn') ? 'Thời gian thực hiện không được nhỏ hơn hiện tại' : '현재시간 이전으로 푸시알림 예약설정이 불가합니다.'),
      type: 'warning',
      timer: 2000,
    });
  }
  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Successful' : ((this.configService.lang === 'vn') ? 'Thành công' : '성공'),
      type: 'success',
      timer: 2000,
    });
  }

  alertError(message) {
    return swal({
      title: message,
      type: 'success',
      timer: 2000,
    });
  }
}
