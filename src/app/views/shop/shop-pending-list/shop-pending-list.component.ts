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
import { NgxSpinnerService } from "ngx-spinner";

declare var swal: any;
@Component({
  selector: 'app-shop-pending-list',
  templateUrl: 'shop-pending-list.component.html',
  styleUrls: ['./shop-pending-list.component.scss']
})
export class ShopPendingListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { "user": ["$all"] }, { "category": ["$all", { "thema": ["$all"] }] }];
  query: any = {
    filter: {
      state: "PENDING"
    }
  };
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
  submittingApprove: boolean = false;
  keyword: string;
  columm_update: string
  fieldSearch: string = null;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  searchTimeOut: number = 250;
  category_id: string;
  admin_message: string;
  zoom_image: string;
  link_map: string;
  id_update: string = null;
  expired_date: number;
  extra_days: number = 30;
  extra_days_for_all: number = 30;
  denied_message: string = null;
  option_search: string = "id";
  default_limit: number = 50;
  listShopToApprove = [];
  listExpiredShop = [];
  listApproveShopIds = [];
  themas: any;
  geolocation: any = null;
  thema_id: string = "null";
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
    this.titleService.setTitle('Pending shop list')
    this.route.params.subscribe(params => {
      this.category_id = params.thema_id;
      if (this.category_id) {
        this.query.filter.category_id = this.category_id
      }
    });
    this.themas = await this.apiService.thema.getList({
      query: {
        fields: ["$all"],
        limit: 9999999,
        filter: {
        }
      }
    });
  }
  filterThema() {
    this.itemsTable.reloadItems();
  }
  openModal(template: TemplateRef<any>, user) {
    this.modalRef = this.modalService.show(template);
    this.link_map = `https://maps.google.com/maps?q=${user.latitude},${user.longitude}&output=embed`
    console.log("@@@ ", this.link_map)

  }
  openModalApprove(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.expired_date = item.expired_date;
    this.geolocation = item.geolocation_api_type;
    this.modalRef = this.modalService.show(template);
  }
  async openModalApproveAll(template: TemplateRef<any>) {
    if (this.itemsTable.selectedRows.length === 0) {
      return;
    }
    const rows = this.itemsTable.selectedRows;
    rows.forEach(row => {
      row.item.deleting = true;
      this.listApproveShopIds.push(row.item.id);
      this.listShopToApprove.push(row.item)
    });
    this.listShopToApprove.forEach(item => {
      if (!this.checkExpire(item)) {
        this.listExpiredShop.push(item)
      }
    })
    try {
      if (this.listExpiredShop.length > 0) {
        this.modalRef = this.modalService.show(template);
      } else {
        try {
          await this.confirmAccept();
        } catch (err) {
          return;
        }
        await this.apiService.shop.approveAll(this.listApproveShopIds, {
          state: 'APPROVED'
        });
        this.itemsTable.selectAllCheckbox = false;
        this.itemsTable.reloadItems();
        this.alertSuccess();
      }
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }
  openModalDeny(template: TemplateRef<any>, item) {
    this.id_update = item.id
    // this.denied_message = item.denied_message;
    this.modalRef = this.modalService.show(template);
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
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
    if (this.thema_id !== "null") {
      this.itemFields = ['$all', { "user": ["$all"] }, { "category": ["$all", { "$filter": { "thema_id": this.thema_id } }, { "thema": ["$all"] }] }];
    } else {
      this.itemFields = ['$all', { "user": ["$all"] }, { "category": ["$all", { "thema": ["$all"] }] }];
    }
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
  openModalZoomImage(template: TemplateRef<any>, item) {
    this.modalRef = this.modalService.show(template);
    this.zoom_image = item.replace('300', '1024')
  }
  replaceImage(event) {
    this.zoom_image = this.zoom_image.replace('1024', '300')
  }
  async getItems() {
    try {
      let query = Object.assign({
        fields: this.itemFields
      }, this.query);
      this.spinner.show();

      this.items.next(await this.apiService.shop.getList({ query }));
      this.spinner.hide();

      this.itemCount = this.apiService.shop.pagination.totalItems;
      this.ref.detectChanges();
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
  addNew() {
    this.router.navigate(['/category/' + this.category_id + "/add"], {
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
  async confirmAccept() {
    return await swal({
      title: 'APPROVED',
      text: (this.configService.lang === 'en') ? 'Are you sure you want to approved?' : ((this.configService.lang === 'vn') ? 'Bạn có muốn chấp nhận không?' : '수락 하시겠습니까?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  async confirmDeny() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'REJECTED' : ((this.configService.lang === 'vn') ? 'Từ chối' : '거부'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to rejected?' : ((this.configService.lang === 'vn') ? 'Bạn có muốn từ chối không' : '거부 하시겠습니까?'),
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
      await this.apiService.shop.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async acceptItemAll(form: NgForm) {
    this.submittingApprove = true;
    if (form.valid) {
      try {
        await this.apiService.shop.approveAll(this.listApproveShopIds, {
          expired_date: moment().valueOf() + (this.extra_days_for_all * 86400000),
          state: 'APPROVED',
          geolocation_api_type: this.geolocation
        });
        this.alertSuccess();
        this.modalRef.hide()
        this.submittingApprove = false;
        this.itemsTable.reloadItems();
      } catch (error) {
        this.alertErrorFromServer(error.error.message);
        this.submittingApprove = false;
      }
    } else {
      this.alertFormNotValid();
      this.submittingApprove = false;
    }
    try {
      // try {
      //   await this.confirmAccept();
      // } catch (error) {
      //   return;
      // }

    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async acceptItem(form: NgForm) {
    this.submittingApprove = true;
    if (form.valid) {
      try {
        await this.apiService.shop.editReTime(this.id_update, {
          expired_date: moment().valueOf() + (this.extra_days * 86400000),
          state: 'APPROVED',
          geolocation_api_type: this.geolocation
        });
        this.alertSuccess();
        this.modalRef.hide()
        this.submittingApprove = false;
        this.itemsTable.reloadItems();
      } catch (error) {
        this.alertErrorFromServer(error.error.message);
        this.submittingApprove = false;
      }
    } else {
      this.alertFormNotValid();
      this.submittingApprove = false;
    }
    try {
      // try {
      //   await this.confirmAccept();
      // } catch (error) {
      //   return;
      // }

    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async acceptItemOld(item: any) {
    try {
      await this.apiService.shop.update(item.id, {
        state: 'APPROVED',
        geolocation_api_type: this.geolocation
      });
      this.alertSuccess();
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }

  }
  checkExpire(item: any) {
    if (item.expired_date) {
      const time: number = (parseInt(item.expired_date) - moment().valueOf()) / (24 * 60 * 60 * 1000)
      if (time >= 0) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }

  }
  mathRemainingTime(unixtimestamp: any) {
    // return new Date(parseInt(unixtimestamp));
    return (unixtimestamp - moment().valueOf()) / (24 * 60 * 60 * 1000)
  }
  ceilRemainingTime(unixtimestamp: any) {
    return Math.ceil((unixtimestamp - moment().valueOf()) / (24 * 60 * 60 * 1000))
  }
  check_extra_day() {
    if (this.extra_days > 180) {
      this.extra_days = 180
    }
    if (this.extra_days < 30) {
      this.extra_days = 30
    }
  }
  check_extra_day_for_all() {
    if (this.extra_days > 180) {
      this.extra_days_for_all = 180
    }
    if (this.extra_days < 30) {
      this.extra_days_for_all = 30
    }
  }
  async rejectedItem(item) {
    try {
      // try {
      //   await this.confirmDeny();
      // } catch (error) {
      //   return;
      // }
      await this.apiService.shop.update(this.id_update, { state: 'REJECTED', denied_message: this.denied_message });
      this.itemsTable.reloadItems();
      this.alertSuccess();
      this.modalRef.hide()
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async rejectAllItem() {
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
        await this.confirmDeny();
      } catch (err) {
        return;
      }
      await this.apiService.shop.rejectAll(ids);
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
  // async approveAllItem() {
  //   if (this.itemsTable.selectedRows.length === 0) {
  //     return;
  //   }
  //   const rows = this.itemsTable.selectedRows;
  //   const ids = [];
  //   const list = [];
  //   rows.forEach(row => {
  //     row.item.deleting = true;
  //     ids.push(row.item.id);
  //     list.push(row.item)
  //   });
  //   try {
  //     try {
  //       await this.confirmAccept();
  //     } catch (err) {
  //       return;
  //     }
  //     // await this.apiService.shop.approveAll(ids);
  //     this.itemsTable.selectAllCheckbox = false;
  //     this.itemsTable.reloadItems();
  //     this.alertSuccess();
  //   } catch (err) {
  //     this.alertErrorFromServer(err.error.message);
  //   } finally {
  //     rows.forEach(row => {
  //       row.item.deleting = false;
  //     });
  //   }
  // }
  async search() {
    this.submitting = true;
    this.query.filter = {
      state: "PENDING"
    }
    if (this.searchRef) { clearTimeout(this.searchRef); }
    this.searchRef = setTimeout(async () => {
      // if (!this.keyword && !this.fieldSearch) {
      //   this.alertNotChooseSearchCondition();
      //   this.submitting = false;
      //   return;
      // }
      if (this.option_search === 'id' && this.keyword) {
        if (this.keyword.length === 36) {
          this.query.filter.id = this.keyword;
        } else {
          this.itemFields = ['$all', { "user": ["$all", { "$filter": { username: { $iLike: `%${this.keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
        }
      } else if (this.option_search === 'nickname') {
        this.itemFields = ['$all', { "user": ["$all", { "$filter": { nickname: { $iLike: `%${this.keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
      } else if (this.option_search === 'gmail') {
        this.itemFields = ['$all', { "user": ["$all", { "$filter": { email: { $iLike: `%${this.keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
      } else if (this.option_search === 'title') {
        this.query.filter.title = { $iLike: `%${this.keyword}%` }
      } else if (this.option_search === 'phone_number') {
        this.query.filter.contact_phone = { $iLike: `%${this.keyword}%` }
      }
      if (this.thema_id !== "null") {
        this.itemFields[2].category.push({ "$filter": { "thema_id": this.thema_id } })
      }
      // if (this.sex !== null) {
      //   this.query.filter.sex = this.sex;
      // }
      await this.getItems();
      this.submitting = false;
    }, this.searchTimeOut);
  }
  async exportAsXLSX() {
    try {
      this.loadingExportExcel = true;
      const data = await this.apiService.shop.getList({
        query: {
          limit: this.itemCount,
          fields: ['$all', { "thema": ["$all"] }],
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
