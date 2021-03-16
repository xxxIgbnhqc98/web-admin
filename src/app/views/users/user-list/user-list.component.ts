import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ExcelService } from '../../../services/excel/excel.service';
import { NgForm } from '@angular/forms';
import { ConfigService } from '../../../services/config/config.service';
import { DatePipe } from '@angular/common';
import * as moment from "moment";

declare var swal: any;
@Component({
  selector: 'app-user-list',
  templateUrl: 'user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all'];
  query: any = {};
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
  submittingJumpLimit: boolean = false;
  keyword: string;
  sex: string = null;
  user_type: string = null;
  link_map: string;
  current_user_id: string;
  update_id: string;
  content_update: string;
  columm_update: string
  label_update: string
  update_item: any;
  fieldSearch: string = null;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  searchTimeOut: number = 250;
  chosenUser: any;
  receiver_id: string;
  admin_message: string;
  id_update: string;
  extra_day: number = 30;
  post_expired_date: number;
  account_type: string = null;
  jump_limit: number = 0;
  add_jump_limit: number = 1;

  listHistories: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCountListHistories: number = 0;
  @ViewChild('itemsTable') itemsTable: DataTable;

  constructor(
    public ref: ChangeDetectorRef,
    public apiService: ApiService,
    public router: Router,
    public route: ActivatedRoute,
    private modalService: BsModalService,
    public titleService: Title,
    public excelService: ExcelService,
    public sanitizer: DomSanitizer,
    private configService: ConfigService,
    private datePipe: DatePipe
  ) { }

  async ngOnInit() {
    console.log(this.items)
    this.titleService.setTitle('User list')
  }
  openModal(template: TemplateRef<any>, user) {
    this.modalRef = this.modalService.show(template);
    this.link_map = `https://maps.google.com/maps?q=${user.posts[0].latitude},${user.posts[0].longitude}&output=embed`
    console.log("@@@ ", this.link_map)

  }
  openModalAddTime(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.post_expired_date = item.post_expired_date;
    this.modalRef = this.modalService.show(template);
  }
  openModalAddJumpLimit(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.jump_limit = item.jump_limit
    this.modalRef = this.modalService.show(template);
  }
  openModalHistory(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-history modal-lg' }));
  }
  async reloadListHistories(params) {
    const { limit, offset, sortBy, sortAsc } = params;
    this.query.limit = limit;
    this.query.offset = offset;
    this.query.order = sortBy ? [[sortBy, sortAsc ? 'ASC' : 'DESC']] : null;
    await this.getListHistories();
  }
  async getListHistories() {
    const query = Object.assign({
      fields: ['$all', { "user": ["$all"] }, { "shop": ["$all"] }],
    }, this.query);
    query.filter = {
      user_id: this.id_update,
      type_1: "JUMP_UP"
    }


    this.listHistories.next(await this.apiService.history.getList({ query }));
    this.itemCountListHistories = this.apiService.history.pagination.totalItems;
    this.ref.detectChanges();
    return this.listHistories;
  }
  calExpiredDate(expired_date) {
    if (expired_date === null) {
      return 'Expired'
    }
    console.log("hahah ",expired_date)
    if (moment(new Date(parseInt(expired_date))).endOf('day').valueOf() < moment().valueOf()) {
      return 'Expired'
    } else {
      // return Math.ceil((expired_date - moment().valueOf()) / (1000 * 60 * 60 * 24))
      console.log("haha ",(moment(new Date(parseInt(expired_date))).endOf('day').valueOf() - moment().valueOf()))
      return Math.ceil((moment(new Date(parseInt(expired_date))).endOf('day').valueOf() - moment().valueOf()) / (24 * 60 * 60 * 1000))

    }
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
  }
  async submitAddTime(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.addItem(form);
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  async submitEditJumpLimit(form: NgForm) {
    this.submittingJumpLimit = true;
    if (form.valid) {
      try {
        await this.apiService.user.updateJumpUpLimit(this.id_update, {
          jump_limit: this.jump_limit + this.add_jump_limit
        });

        this.alertSuccess();
        this.modalRef.hide()
        this.submittingJumpLimit = false;
        this.itemsTable.reloadItems();
      } catch (error) {
        this.alertErrorFromServer(error.error.message);
        this.submittingJumpLimit = false;
      }
    } else {
      this.alertFormNotValid();
      this.submittingJumpLimit = false;
    }
  }
  async submitEditTime(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      try {
        await this.apiService.user.update(this.id_update, {
          post_expired_date: moment().valueOf() + (this.extra_day * 86400000)
        });

        this.alertSuccess();
        this.modalRef.hide()
        this.submitting = false;
        this.itemsTable.reloadItems();
      } catch (error) {
        this.alertErrorFromServer(error.error.message);
        this.submitting = false;
      }
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  async addItem(form: NgForm) {
    try {
      if (this.post_expired_date) {
        this.post_expired_date = this.post_expired_date
      } else {
        this.post_expired_date = moment().valueOf()
      }
      await this.apiService.user.update(this.id_update, {
        post_expired_date: parseInt(this.post_expired_date.toString()) + (this.extra_day * 86400000)
      });

      this.alertSuccess();
      this.modalRef.hide()
      this.submitting = false;
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }

  async deleteAll() {
    if (this.itemsTable.selectedRows.length === 0) {
      return;
    }
    const rows = this.itemsTable.selectedRows;
    const ids = [];
    rows.forEach(row => {
      row.item.deleting = true;
      ids.push(row.item.id);
    });
    try {
      try {
        await this.confirmDelete();
      } catch (err) {
        return;
      }
      await this.apiService.user.deleteAll(ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }

  openModal1(template: TemplateRef<any>, user) {
    this.modalRef = this.modalService.show(template);
    this.update_item = user

  }
  openModalSendmessage(template: TemplateRef<any>, id) {
    this.modalRef = this.modalService.show(template);
    this.receiver_id = id
  }
  openModalPenaltyOption(templatePenaltyOption: TemplateRef<any>, item) {
    this.modalRef = this.modalService.show(templatePenaltyOption);
    this.current_user_id = item;
  }
  async alertConfirmUnBlock() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Are you sure to unblock this user?' : ((this.configService.lang === 'vn') ? 'Gỡ bỏ hình phạt' : '패널티 해제하기'),
      // text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'Bạn chắc chứ?' : '확실한가요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  async reloadItems(params) {
    const { limit, offset, sortBy, sortAsc } = params;
    this.query.limit = limit;
    // this.query.filter = {
    //   $or: [
    //     {
    //       host_register_status: "ACCEPT"
    //     }, {
    //       guest_register_status: "ACCEPT"
    //     }
    //   ]
    // }
    this.query.offset = offset;
    this.query.order = sortBy ? [
      [sortBy, sortAsc ? 'ASC' : 'DESC']
    ] : null;
    if (!sortBy && !sortAsc) {
      this.query.order = [['updated_at', 'DESC']]
    }
    await this.getItems();
  }
  alertCopied(text) {
    return swal({
      title: `Copied '${text}'`,
      type: 'success',
      timer: 1000,
    });
  }
  spliceText(text: string) {
    return text.slice(0, 8)
  }
  spliceText2(text: string) {
    return text.slice(0, 5) + '...'
  }
  async alertConfirmBlockIp() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'User IP Block' : ((this.configService.lang === 'vn') ? 'Khóa IP người dùng' : 'IP 차단하기'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'Bạn chắc chứ?' : '확실한가요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  async alertDeleteAccount() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete account' : ((this.configService.lang === 'vn') ? 'Xoá người dùng' : '계정 삭제'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'Bạn chắc chứ?' : '확실한가요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  openListPenaltiesModal(template: TemplateRef<any>, item) {
    this.chosenUser = item;
    this.chosenUser.penaltys.sort((b: any, a: any) => (a.start_date_unix_timestamp > b.start_date_unix_timestamp) ? 1 : ((b.start_date_unix_timestamp > a.start_date_unix_timestamp) ? -1 : 0));
    this.modalRef = this.modalService.show(template);
  }
  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Success' : ((this.configService.lang === 'vn') ? 'Thành công' : '성공'),
      type: 'success',
      timer: 2000,
    });
  }

  alertFailed() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Failed action!' : ((this.configService.lang === 'vn') ? 'Thao tác thất bại.' : '실패되었습니다.'),
      type: 'warning',
      timer: 2000,
    });
  }
  async getItems() {
    try {
      let query = Object.assign({
        fields: this.itemFields
      }, this.query);
      this.items.next(await this.apiService.user.getList({ query }));
      this.itemCount = this.apiService.user.pagination.totalItems;
      this.ref.detectChanges();
      return this.items;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  editItem(item) {
    this.router.navigate(['/users/add/', item.id], {
      relativeTo: this.route
    });
  }
  async alertDeleteSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete successful' : ((this.configService.lang === 'vn') ? 'Xóa thành cồng' : '정상적으로 삭제되었습니다.'),
      type: 'success',
      timer: 1000,
    });
  }
  async confirmDelete() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'DELETE' : ((this.configService.lang === 'vn') ? 'Xóa' : '삭제'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to delete?' : ((this.configService.lang === 'vn') ? 'Bạn có chắc chắn muốn xóa không?' : '삭제를 진행할까요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  async deleteItem(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.user.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async search() {
    this.submitting = true;
    this.query.filter = {};
    if (this.searchRef) { clearTimeout(this.searchRef); }
    this.searchRef = setTimeout(async () => {
      // if (!this.keyword && !this.fieldSearch) {
      //   this.alertNotChooseSearchCondition();
      //   this.submitting = false;
      //   return;
      // }
      if (this.keyword === '') {
        this.keyword = undefined;
      } else {
        switch (this.fieldSearch) {
          case null:
            if (this.keyword) {
              if (this.keyword.length === 36) {
                this.query.filter = { id: this.keyword };
              } else {
                this.query.filter.$and = [{
                  $or: {
                    nickname: { $iLike: `%${this.keyword}%` },
                    email: { $iLike: `%${this.keyword}%` },
                    phone: { $iLike: `%${this.keyword}%` },
                    username: { $iLike: `%${this.keyword}%` }
                  }
                }]
              }
            }

            break;
          case 'phone':
            let array = this.keyword.split('');
            let phone_search;
            if (array[0] === '0') {
              for (var i = 0; i < array.length; i++) {
                if (array[i] === '0') {
                  array.splice(i, 1);
                  break;
                }
              }
              phone_search = array.toString().replace(/,/g, '');

            } else {
              phone_search = this.keyword.toString().replace('+', '');
            }
            console.log("@ahia z", phone_search)
            this.query.filter = { phone: { $iLike: `%${phone_search}%` } };
            break;
          case 'nickname':
            this.query.filter = { nickname: { $iLike: `%${this.keyword}%` } };
            break;
          case 'id':
            this.query.filter = { username: { $iLike: `%${this.keyword}%` } };
            break;
          case 'email':
            this.query.filter = { email: { $iLike: `%${this.keyword}%` } };
            break;
          case 'id_code':
            this.query.filter = { id: this.keyword };
            break;
        }
      }
      if (this.account_type !== null) {
        this.query.filter.account_type = this.account_type;
      }
      await this.getItems();
      this.submitting = false;
    }, this.searchTimeOut);
  }
  async exportAsXLSX() {
    try {
      this.loadingExportExcel = true;
      const data = await this.apiService.user.getList({
        query: {
          limit: this.itemCount,
          fields: ['$all'],
          order: [['updated_at', 'DESC']]
        }
      });
      const data_map = data.map(item => {
        return {
          id: item.id,
          fullname: item.fullname,
          email: item.email,
          avatar: item.avatar,
          birthday: item.birthday ? item.birthday : 'No info',
          phone: item.phone,
          sex: item.sex
        }
      });
      this.excelService.exportAsExcelFile(data_map, 'User_list');
      this.loadingExportExcel = false;
    } catch (error) {
      this.loadingExportExcel = false;
      console.log('error: ', error);
    }
  }

  getDateFromUnixTimestamp(unixtimestamp: any) {
    return new Date(parseInt(unixtimestamp));
  }

  alertNotChooseSearchCondition() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please choose search condition and enter keyword' : ((this.configService.lang === 'vn') ? 'Vui lòng chọn điều kiện tìm kiếm và nhập từ khóa' : '검색 조건을 선택해주세요'),
      type: 'warning',
      timer: 2000,
    });
  }

  alertErrorFromServer(message) {
    return swal({
      title: message,
      type: 'warning',
      timer: 2000,
    });
  }
}
