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
import { NgxSpinnerService } from "ngx-spinner";

declare var swal: any;
@Component({
  selector: 'app-comment-post-list',
  templateUrl: 'comment-post-list.component.html',
  styleUrls: ['./comment-post-list.component.scss']
})
export class CommentListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { 'user': ['$all'] }];
  query: any = {
    filter: {
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
  // post_id: string = null;
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
    this.titleService.setTitle('Comment list')
    await this.getItems(this.type_search);
    // this.route.params.subscribe(async (params) => {
    //   this.post_id = params.post_id;
    //   if (this.post_id) {
    //     this.query.filter.post_id = this.post_id
    //   }
    // });
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
      if (this.type_search === "POST") {
        await this.apiService.comment.deleteAll(ids);
      } {
        await this.apiService.review.deleteAll(ids);
      }
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
      console.log("DSadasdas ", type)
      this.spinner.show();

      if (type === 'SHOP' || type === 'RECRUIT' || type === "SALE_SHOP") {
        this.query.filter = {}
        if (type === 'RECRUIT') {
          this.query.filter.type = type
        } else if (type === 'SHOP') {
          this.query.filter.type = 'SHOP'
        } else {
          this.query.filter.type = 'RECRUIT'
          this.query.filter.board_type = "SHOP_SALES_BOARD"
        }
        console.log("vao shop")
        this.itemFields = ['$all', { 'shop': ['$all', { 'category': ['$all', { 'thema': ['$all'] }] }] }, { 'recruit': ['$all', { 'category': ['$all', { 'thema': ['$all'] }] }] }, { 'user': ['$all'] }];
        query = Object.assign({
          fields: this.itemFields
        }, this.query);

        this.items.next(await this.apiService.review.getList({ query }));

        this.itemCount = this.apiService.review.pagination.totalItems;
      } else {
        this.query.filter = {

        }
        console.log("vao post")

        this.itemFields = ['$all', { 'post': ['$all', { 'category': ['$all', { 'thema': ['$all'] }] }] }, { 'user': ['$all'] }];
        query = Object.assign({
          fields: this.itemFields
        }, this.query);
        this.items.next(await this.apiService.comment.getList({ query }));
        this.itemCount = this.apiService.comment.pagination.totalItems;
      }

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
      if (this.type_search === "POST") {
        await this.apiService.comment.delete(item.id);
      } {
        await this.apiService.review.delete(item.id);
      }
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
      const data = await this.apiService.comment.getList({
        query: {
          limit: this.itemCount,
          fields: ['$all'],
          order: [['updated_at', 'DESC']]
        }
      });
      const data_map = data.map(item => {
        return {
          id: item.id,
          name: item.name,
          thema_name: item.thema.name
        }
      });
      this.excelService.exportAsExcelFile(data_map, `category_list`);
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
