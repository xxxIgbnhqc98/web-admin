import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ExcelService } from '../../../services/excel/excel.service';
import { ConfigService } from '../../../services/config/config.service';
import { DatePipe } from '@angular/common';
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";

declare var swal: any;
@Component({
  selector: 'app-level-history',
  templateUrl: 'level-history.component.html',
  styleUrls: ['./level-history.component.scss']
})
export class LevelHistoryComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { "user": ["$all", "$paranoid"] }];
  query: any = {
    filter: {
      category: "USER",
      type_1: "GIFT_ROLL"
    }
  };
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
  submittingJumpLimit: boolean = false;
  keyword: string;
  fieldSearch: string = null;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  searchTimeOut: number = 250;
  type_search: string = null;
  search_date: any;

  @ViewChild('itemsTable') itemsTable: DataTable;

  constructor(
    private spinner: NgxSpinnerService,
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
    this.titleService.setTitle('Level transaction list')
  }
  calExpiredDate(expired_date) {
    if (expired_date === null) {
      return 'Expired'
    }
    console.log("hahah ", expired_date)
    if (moment(new Date(parseInt(expired_date))).endOf('day').valueOf() < moment().valueOf()) {
      return 'Expired'
    } else {
      // return Math.ceil((expired_date - moment().valueOf()) / (1000 * 60 * 60 * 24))
      console.log("haha ", (moment(new Date(parseInt(expired_date))).endOf('day').valueOf() - moment().valueOf()))
      return Math.ceil((moment(new Date(parseInt(expired_date))).endOf('day').valueOf() - moment().valueOf()) / (24 * 60 * 60 * 1000))

    }
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'H??y nh???p ?????y ????? th??ng tin' : '?????? ????????? ???????????? ???????????????'),
      type: 'warning',
      timer: 2000,
    });
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
      await this.apiService.history.deleteAll(ids);
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
      title: (this.configService.lang === 'en') ? 'User IP Block' : ((this.configService.lang === 'vn') ? 'Kh??a IP ng?????i d??ng' : 'IP ????????????'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'B???n ch???c ch????' : '????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  async alertDeleteAccount() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete account' : ((this.configService.lang === 'vn') ? 'Xo?? ng?????i d??ng' : '?????? ??????'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'B???n ch???c ch????' : '????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Success' : ((this.configService.lang === 'vn') ? 'Th??nh c??ng' : '??????'),
      type: 'success',
      timer: 2000,
    });
  }

  alertFailed() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Failed action!' : ((this.configService.lang === 'vn') ? 'Thao t??c th???t b???i.' : '?????????????????????.'),
      type: 'warning',
      timer: 2000,
    });
  }
  async getItems() {
    try {
      let query = Object.assign({
        fields: this.itemFields
      }, this.query);
      this.spinner.show();
      this.items.next(await this.apiService.history.getList({ query }));
      this.spinner.hide();
      this.itemCount = this.apiService.history.pagination.totalItems;
      this.ref.detectChanges();
      return this.items;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async alertDeleteSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete successful' : ((this.configService.lang === 'vn') ? 'X??a th??nh c???ng' : '??????????????? ?????????????????????.'),
      type: 'success',
      timer: 1000,
    });
  }
  async confirmDelete() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'DELETE' : ((this.configService.lang === 'vn') ? 'X??a' : '??????'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to delete?' : ((this.configService.lang === 'vn') ? 'B???n c?? ch???c ch???n mu???n x??a kh??ng?' : '????????? ????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  async deleteItem(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.history.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async searchType() {
    if (this.type_search === 'DESC') {
      this.query.order = [['user', 'level', 'DESC']]
      await this.getItems();

    } else if (this.type_search === 'ASC') {
      this.query.order = [['user', 'level', 'ASC']]
      await this.getItems();

    }

  }
  async search() {
    this.submitting = true;
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
        this.itemFields = ['$all', { "user": ["$all", { "$filter": { level: this.keyword } }] }];
      }
      if (this.search_date) {
        this.query.filter.created_at_unix_timestamp = {
          '$gte': moment(this.search_date[0]).set('hour', 0).set('minute', 0).valueOf(),
          '$lte': moment(this.search_date[1]).set('hour', 23).set('minute', 59).valueOf()
        };
      }
      await this.getItems();
      this.submitting = false;
    }, this.searchTimeOut);
  }
  getDateFromUnixTimestamp(unixtimestamp: any) {
    return new Date(parseInt(unixtimestamp));
  }

  alertNotChooseSearchCondition() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please choose search condition and enter keyword' : ((this.configService.lang === 'vn') ? 'Vui l??ng ch???n ??i???u ki???n t??m ki???m v?? nh???p t??? kh??a' : '?????? ????????? ??????????????????'),
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
