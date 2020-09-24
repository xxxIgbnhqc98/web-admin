import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { ConfigService } from '../../../services/config/config.service';

declare let swal: any;

@Component({
  templateUrl: 'sent.component.html',
  styleUrls: ['./sent.component.scss']
})
export class SentPushNotificationComponent implements OnInit {
  thumbDefault: string = 'https://kormassage.s3.ap-northeast-2.amazonaws.com/resized-image-1600918517975.png';
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all'];
  query: any = {};
  queryExport: any = {};
  searchTimeOut: number = 250;
  searchRef: any;
  isAddingRate: boolean = false;
  decodeUrl: boolean = false;
  submitting: boolean = false;
  type: string = null;
  bonus_percentage: any = null;
  user_id: string = null;
  field: string = null;
  keyword: string = null;
  checkbox_paranoid: any;
  is_get_list_push_noti_deleted: boolean = false;

  @ViewChild('itemsTable') itemsTable: DataTable;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public apiService: ApiService,
    public configService: ConfigService,
    private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  async reloadItems(params) {
    const { limit, offset, sortBy, sortAsc } = params;
    this.query.limit = limit;
    this.query.offset = offset;
    this.query.order = sortBy ? [[sortBy, sortAsc ? 'ASC' : 'DESC']] : [['created_at', 'DESC']];
    await this.getItems();
  }

  async getItems() {
    const decodeUrl = this.decodeUrl;
    const query = Object.assign({
      fields: this.itemFields
    }, this.query);
    this.items.next(await this.apiService.pushNotification.getList({ query, decodeUrl }));
    this.itemCount = this.apiService.pushNotification.pagination.totalItems;
    this.ref.detectChanges();
    return this.items;
  }

  rowClick(event) {
    console.log('Row clicked', event);
  }

  rowDoubleClick(event) {
    console.log('Row double click', event);
  }

  alertSearchApp() {
    return swal({
      title: 'This feature is in development',
      type: 'info',
      timer: 3000,
    });
  }

  async search(form: NgForm) {
    this.submitting = true;
    try {
      await this.searchAPI(form);
    } catch (err) {
      console.log('err: ', err);
    } finally {
      this.submitting = false;
    }
  }

  async searchAPI(form: NgForm) {
    this.query.filter = {};
    if (this.field !== 'null') {
      switch (this.field) {
        case 'user_id':
          this.query.filter = { 'user_id': this.keyword };
          break;
      }
    }
    this.decodeUrl = true;
    this.getItems();
  }

  getAgeFromYOB(yob: number) {
    return new Date().getFullYear() - yob;
  }

  async alertConfirmUpdate() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Are you sure to apply new change?' : ((this.configService.lang === 'vn') ? 'Xác nhận áp dụng thay đổi mới?' : '변경사항을  반영하시겠습니까?'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'Bạn chắc chứ?' : '확실한가요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }

  async alertConfirmDeleteNotification() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Confirm delete this notification' : ((this.configService.lang === 'vn') ? 'Bạn có chắc chắn muốn xóa không?' : '삭제를 진행할까요?'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'Bạn chắc chứ?' : '확실한가요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }

  async alertConfirmSendNotification() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Confirm send this notification' : ((this.configService.lang === 'vn') ? 'Xác nhận gửi thông báo này' : '이 알림 보내기 확인'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'Bạn chắc chứ?' : '확실한가요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }

  alertFailed() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Upload failed. Please check your input' : ((this.configService.lang === 'vn') ? 'Tải lên thất bại. Vui lòng kiểm tra dữ liệu nhập' : '업로드가 실패되었습니다.  업로드 내용을 확인 바랍니다.'),
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

  async disableNotification(noitification) {
    try {
      try { await this.alertConfirmUpdate(); } catch (err) { this.itemsTable.reloadItems(); return; }

      await this.apiService.pushNotification.update(noitification.id, { status: 0 });
      this.itemsTable.reloadItems();
      this.alertSuccess();
    } catch (error) {
      console.log('error: ', error);
      this.alertFailed();
      noitification.status = true;
    }
  }

  async enableNotification(noitification) {
    try {
      try { await this.alertConfirmUpdate(); } catch (err) { this.itemsTable.reloadItems(); return; }

      await this.apiService.pushNotification.update(noitification.id, { status: 1 });
      this.itemsTable.reloadItems();
      this.alertSuccess();
    } catch (error) {
      console.log('error: ', error);
      this.alertFailed();
      noitification.status = false;
    }
  }

  async deleteNotification(notification) {
    try {
      try { await this.alertConfirmDeleteNotification(); } catch (err) { return; }
      await this.apiService.pushNotification.delete(notification.id);
      this.itemsTable.reloadItems();
      this.alertSuccess();
    } catch (error) {
      console.log('error: ', error);
      this.alertFailed();
    }
  }

  async sendNotification(notification) {
    try {
      try { await this.alertConfirmSendNotification(); } catch (err) { return; }
      await this.apiService.pushNotification.sendFCM(notification.id, notification.type);
      this.itemsTable.reloadItems();
      this.alertSuccess();
    } catch (error) {
      console.log('error: ', error);
      this.alertFailed();
    }
  }

  getDateFromUnixTimestamp(unixtimestamp) {
    unixtimestamp = parseInt(unixtimestamp);
    return unixtimestamp ? new Date(unixtimestamp) : new Date();
  }

  alertCopied() {
    return swal({
      title: 'Copied',
      type: 'success',
      timer: 1000,
    });
  }
  editItem(item) {
    this.router.navigate(['/admin/user/add', item.id]);
  }


  onChange(item) {
    if (item.status) {
      console.log('bambi goi enable ne');
      this.enableNotification(item);
    } else {
      console.log('bambi goi disable ne');
      this.disableNotification(item);
    }
  }

  async getListPushNotiDeleted(event) {
    if (event.target.checked) {
      this.is_get_list_push_noti_deleted = true;
      this.itemFields = ['$all', '$paranoid'];
      this.query.filter = { deleted_at: { '$ne': null } };
    } else {
      this.is_get_list_push_noti_deleted = false;
      delete this.query.filter.deleted_at;
      this.itemFields = ['$all'];
    }
    await this.getItems();
  }
}
