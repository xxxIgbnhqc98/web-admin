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
import { async } from '@angular/core/testing';
import * as moment from "moment";
import * as _ from 'lodash';
import { NgxSpinnerService } from "ngx-spinner";

declare var $: any;

declare var swal: any;
@Component({
  selector: 'app-report-list',
  templateUrl: 'report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { 'post': ['$all', '$paranoid', { 'user': ['$all', '$paranoid'] }] }, { 'review': ['$all', '$paranoid', { 'user': ['$all', '$paranoid'] }] }, { 'user': ['$all', '$paranoid'] }];
  query: any = {
    filter: {
      report: { $gt: 0 }
    }
  };
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  keyword: string;
  name: string;
  id_update: string;
  columm_update: string
  fieldSearch: string = null;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  searchTimeOut: number = 250;
  type_search: string = "POST";
  default_limit: number = 50;
  zoom_image: string = null
  // post_id: string = null;
  record_today: number;
  title_full: string;

  listCommentOfConversation: any = [];

  post_id: string;
  post: string;

  page_list_comments: number = 1;
  load_more: boolean = false;
  loading_api: boolean = false;
  limit_list_comments: number = 10;
  themas: any;
  thema_id: string;
  category_id: string;
  categories: any;
  count_list_comments: number = 0;
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
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit() {
    console.log(this.items)
    this.titleService.setTitle('Report list')
    await this.getItems(this.type_search);
    // this.route.params.subscribe(async (params) => {
    //   this.post_id = params.post_id;
    //   if (this.post_id) {
    //     this.query.filter.post_id = this.post_id
    //   }
    // });
  }
  openModalZoomImage(template: TemplateRef<any>, item) {
    this.modalRef = this.modalService.show(template);
    this.zoom_image = item.replace('300', '1024')
  }
  openModalTitleFull(template: TemplateRef<any>, text) {
    this.title_full = text
    this.modalRef = this.modalService.show(template);
  }
  async openModalInfoPost(template: TemplateRef<any>, item) {
    try {
      this.loading_api = true;
      this.page_list_comments = 1;
      this.post_id = item.id
      this.post = item
      this.modalRef = this.modalService.show(template);
      this.listCommentOfConversation = await this.apiService.comment.getList({
        query: {
          fields: ['$all', '$paranoid', { 'user': ['$all', '$paranoid'] }, { 'comment_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
          filter: { post_id: this.post_id, parent_id: null },
          order: [['created_at_unix_timestamp', 'DESC']],
          limit: this.limit_list_comments,
          page: this.page_list_comments
        }
      });
      this.listCommentOfConversation.forEach(element => {
        element.comment_childs = _.orderBy(element.comment_childs, ['created_at_unix_timestamp'], ['asc']);
      });
      // this.listCommentOfConversation.reverse();
      this.count_list_comments = this.apiService.comment.pagination.totalItems;
      this.ref.detectChanges();
      await this.autoScroll();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  async autoScroll() {
    $(document).ready(function () {
      var itemList = document.getElementById("msg_history");
      itemList.scrollTop = itemList.scrollHeight;
    })
  }
  async onScrollDown() {
    this.load_more = true;
    await this.loadMoreListComment();
    this.load_more = false;
  }
  async loadMoreListComment() {
    try {
      if (this.listCommentOfConversation.length < this.count_list_comments) {
        this.page_list_comments = this.page_list_comments + 1;
        console.log("#@$%% ", this.page_list_comments)
        const res = await this.apiService.comment.getList({
          query: {
            fields: ['$all', { 'user': ['$all', '$paranoid'] }, { 'comment_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
            filter: { post_id: this.post_id, parent_id: null },
            order: [['created_at_unix_timestamp', 'DESC']],
            limit: this.limit_list_comments,
            page: this.page_list_comments
          }
        });
        this.listCommentOfConversation.forEach(element => {
          element.comment_childs = _.orderBy(element.comment_childs, ['created_at_unix_timestamp'], ['asc']);
        });
        const old_res: any = this.listCommentOfConversation
        this.listCommentOfConversation = [...old_res, ...res];
        // this.listCommentOfConversation.reverse();
      }
    } catch (error) {

    }
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'H??y nh???p ?????y ????? th??ng tin' : '?????? ????????? ???????????? ???????????????'),
      type: 'warning',
      timer: 2000,
    });
  }

  async alertConfirmUnBlock() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Are you sure to unblock this user?' : ((this.configService.lang === 'vn') ? 'G??? b??? h??nh ph???t' : '????????? ????????????'),
      // text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'B???n ch???c ch????' : '????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  sliceText(text) {
    return text.slice(0, 20)
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
      await this.apiService.report.deleteAll(ids);
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
    this.query.offset = offset;
    this.query.order = sortBy ? [
      [sortBy, sortAsc ? 'ASC' : 'DESC']
    ] : null;
    if (!sortBy && !sortAsc) {
      this.query.order = [['updated_at', 'DESC']]
    }
    await this.getItems(this.type_search);
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
  changeTypeSearch(type) {
    this.type_search = type;
    this.getItems(this.type_search);
  }
  async getItems(type) {
    try {
      let query = Object.assign({
        fields: this.itemFields
      }, this.query);
      if (type === 'POST') {
        this.query.filter = {
          post_id: { $ne: null }
        }
      } else {
        this.query.filter = {
          review_id: { $ne: null }

        }
      }
      query = Object.assign({
        fields: this.itemFields
      }, this.query);
      this.spinner.show();

      this.items.next(await this.apiService.report.getList({ query }));
      this.itemCount = this.apiService.report.pagination.totalItems;
      const queryCountToday: any = { ...query }
      const before12Hour: number = moment().subtract(1, 'days').valueOf()
      queryCountToday.filter.created_at_unix_timestamp = { $gte: before12Hour }
      this.record_today = await this.apiService.report.countToday({ query: queryCountToday })
      console.log("chay toi day")
      this.ref.detectChanges();
      this.spinner.hide();

      return this.items;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  editItem(item) {
    this.router.navigate(['/shop/add/', item.id], {
      relativeTo: this.route
    });
  }
  getListShop(item) {
    this.router.navigate(['/shop/list/', item.id], {
      relativeTo: this.route
    });
  }
  // addNew() {
  //   this.router.navigate(['/category/' + this.category_id + "/add"], {
  //     relativeTo: this.route
  //   });
  // }
  async alertConfirmSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'successfully' : ((this.configService.lang === 'vn') ? 'th??nh c??ng' : '???????????????.'),
      type: 'success',
      timer: 1000,
    });
  }
  async alertRestoreSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'successfully' : ((this.configService.lang === 'vn') ? 'th??nh c??ng' : '???????????????.'),
      type: 'success',
      timer: 1000,
    });
  }
  async alertDeleteSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete successfully' : ((this.configService.lang === 'vn') ? 'X??a th??nh c??ng' : '??????????????? ?????????????????????.'),
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
  async confirmAccept() {
    return await swal({
      title: 'APPROVED',
      text: (this.configService.lang === 'en') ? 'Are you sure you want to approved?' : ((this.configService.lang === 'vn') ? 'B???n c?? mu???n ch???p nh???n kh??ng?' : '?????? ???????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  async confirmDeny() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'REJECTED' : ((this.configService.lang === 'vn') ? 'T??? ch???i' : '??????'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to rejected?' : ((this.configService.lang === 'vn') ? 'B???n c?? mu???n t??? ch???i kh??ng' : '?????? ???????????????????'),
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
      await this.apiService.report.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async search() {
    this.submitting = true;

    if (this.searchRef) { clearTimeout(this.searchRef); }
    this.searchRef = setTimeout(async () => {
      // if (!this.keyword) {
      //   this.submitting = false;
      //   return;
      // }
      if (this.keyword && this.keyword.length !== 0) {
        if (this.keyword.length === 36) {
          this.query.filter.id = this.keyword;
        } else {
          this.query.filter.content = { $iLike: `%${this.keyword}%` }
        }
      } else {
        this.query.filter = {}
      }
      // if (this.sex !== null) {
      //   this.query.filter.sex = this.sex;
      // }
      await this.getItems(this.type_search);
      this.submitting = false;
    }, this.searchTimeOut);
  }
  async exportAsXLSX() {
    try {
      this.loadingExportExcel = true;
      const data = await this.apiService.report.getList({
        query: {
          limit: this.itemCount,
          fields: ['$all'],
          order: [['updated_at', 'DESC']]
        }
      });
      const data_map = data.map((item: any) => {
        return {
          id: item.id,
        }
      });
      this.excelService.exportAsExcelFile(data_map, `category_list`);
      this.loadingExportExcel = false;
    } catch (error) {
      this.loadingExportExcel = false;
      console.log('error: ', error);
    }
  }
  async confirmAllItem() {
    if (this.itemsTable.selectedRows.length === 0) {
      return;
    }
    const rows = this.itemsTable.selectedRows;
    const ids = [];
    rows.forEach(row => {
      row.item.deleting = true;
      if (this.type_search === 'POST') {
        ids.push(row.item.post_id);
      } else {
        ids.push(row.item.review_id);
      }
    });
    try {
      await this.apiService.report.confirmAll(ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertConfirmSuccess();
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }
  async restoreAllItem() {
    if (this.itemsTable.selectedRows.length === 0) {
      return;
    }
    const rows = this.itemsTable.selectedRows;
    const ids = [];
    rows.forEach(row => {
      row.item.deleting = true;
      if (this.type_search === 'POST') {
        ids.push(row.item.post_id);
      } else {
        ids.push(row.item.review_id);
      }
    });
    try {
      await this.apiService.report.restoreAll(ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertRestoreSuccess();
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }
  async confirmItem(item) {
    const ids = [];
    if (this.type_search === 'POST') {
      ids.push(item.post_id);
    } else {
      ids.push(item.review_id);
    }
    // rows.forEach(row => {
    //   row.item.deleting = true;
    //   if (this.type_search === 'POST') {
    //     ids.push(row.item.post_id);
    //   } else {
    //     ids.push(row.item.review_id);
    //   }
    // });
    try {
      await this.apiService.report.confirmAll(ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertConfirmSuccess();
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    }
  }
  async restoreItem(item) {
    const ids = [];
    if (this.type_search === 'POST') {
      ids.push(item.post_id);
    } else {
      ids.push(item.review_id);
    }
    // rows.forEach(row => {
    //   row.item.deleting = true;
    //   if (this.type_search === 'POST') {
    //     ids.push(row.item.post_id);
    //   } else {
    //     ids.push(row.item.review_id);
    //   }
    // });
    try {
      await this.apiService.report.restoreAll(ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertRestoreSuccess();
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    }
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
