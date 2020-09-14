import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef, ElementRef } from '@angular/core';
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
import { async } from '@angular/core/testing';

declare var swal: any;
@Component({
  selector: 'app-shop-banner-list',
  templateUrl: 'shop-banner-list.component.html',
  styleUrls: ['./shop-banner-list.component.scss']
})
export class ShopBannerListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
  query: any = {
    filter: {
      state: { $in: ["APPROVED"] }
    }
  };
  option_search: string = 'id';
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
  keyword: string;
  columm_update: string
  fieldSearch: string = null;
  submittingCheck: boolean = false;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  searchTimeOut: number = 250;
  category_id: string;
  admin_message: string;
  zoom_image: string;
  link_map: string;
  images_event: any = []
  loadingUploadImage: boolean = false;
  title_event: string;
  description: string;
  shop_id_event: string;
  event_id: string;
  currentDate: Date = new Date();
  value_of_day: any = [];
  state: string = null;
  id_update: string = null;
  expired_date: number;
  extra_days: number = 30;
  thema_id: string;
  select_ids: any;
  @ViewChild('itemsTable') itemsTable: DataTable;
  @ViewChild('fileImage') fileImageElementRef: ElementRef;

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
    let thema;
    this.route.params.subscribe(async (params) => {
      this.thema_id = params.thema_id;
      try {
        thema = await this.apiService.thema.getItem(this.thema_id, {
          query: { fields: ['$all'] }
        });
      } catch{
        this.backToList();

      }
      this.titleService.setTitle(thema.name)
      this.select_ids = thema.ids_shop_banner
    });
  }
  backToList() {
    this.router.navigate(['/thema/thema-list'], { relativeTo: this.route });
  }
  openModalZoomImage(template: TemplateRef<any>, item) {
    this.modalRef = this.modalService.show(template);
    this.zoom_image = item.replace('300', '1024')
  }
  replaceImage(event) {
    this.zoom_image = this.zoom_image.replace('1024', '300')
  }
  openModal(template: TemplateRef<any>, user) {
    this.modalRef = this.modalService.show(template);
    this.link_map = `https://maps.google.com/maps?q=${user.latitude},${user.longitude}&output=embed`
  }
  openModalAddTime(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.expired_date = item.expired_date;
    this.modalRef = this.modalService.show(template);
  }
  async submitAddTime(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      try {
        const date: number = moment().valueOf()
        if (this.expired_date < date) {
          this.expired_date = date
        }
        await this.apiService.shop.editReTime(this.id_update, {
          expired_date: parseInt(this.expired_date.toString()) + (this.extra_days * 86400000)
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
  openModalEvent(template: TemplateRef<any>, item) {
    this.shop_id_event = item.id
    if (item.events.length === 0) {
      this.title_event = null;
      this.description = null;
      this.images_event = [];
      this.value_of_day = [this.currentDate, this.currentDate];
      this.event_id = null
    } else {
      this.title_event = item.events[0].title
      this.description = item.events[0].description
      this.value_of_day = [new Date(parseInt(item.events[0].start_time)), new Date(parseInt(item.events[0].end_time))];
      this.images_event = item.events[0].images
      this.event_id = item.events[0].id
      this.state = item.events[0].state
    }
    this.modalRef = this.modalService.show(template);
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
  }
  mathRemainingTime(unixtimestamp: any) {
    // return new Date(parseInt(unixtimestamp));
    return (unixtimestamp - moment().valueOf()) / (24 * 60 * 60 * 1000)
  }
  ceilRemainingTime(unixtimestamp: any) {
    return Math.ceil((unixtimestamp - moment().valueOf()) / (24 * 60 * 60 * 1000))
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
  async submitAddEvent(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      if (!this.event_id) {
        await this.addItem(form);
      } else {
        await this.updateItem(form);

      }
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  async addItem(form: NgForm) {
    try {
      await this.apiService.event.add({
        title: this.title_event,
        description: this.description,
        images: this.images_event,
        state: "APPROVED",
        start_time: moment(this.value_of_day[0]).valueOf(),
        end_time: moment(this.value_of_day[1]).valueOf(),
        shop_id: this.shop_id_event,
        created_by_admin: true
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
  async updateItem(form: NgForm) {
    try {
      await this.apiService.event.update(this.event_id, {
        title: this.title_event,
        description: this.description,
        images: this.images_event,
        // state: "APPROVED",
        start_time: moment(this.value_of_day[0]).valueOf(),
        end_time: moment(this.value_of_day[1]).valueOf(),
        shop_id: this.shop_id_event,
        created_by_admin: true
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
      if (this.thema_id) {
        this.itemFields = ['$all', { "category": ["$all", { "$filter": { "thema_id": this.thema_id } }, { "thema": ["$all"] }] }, { "events": ["$all"] }];

      }
      let query = Object.assign({
        fields: this.itemFields
      }, this.query);
      console.log("@@@@ ", this.itemFields)
      this.items.next(await this.apiService.shop.getList({ query }));
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
    this.router.navigate(['/shop/' + this.category_id + "/add"], {
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
  async setState(state) {
    return await swal({
      title: state,
      text: `Are you sure you want to ${state}?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  async setStateItem(id, state) {
    try {
      try {
        await this.setState(state);
      } catch (error) {
        return;
      }
      await this.apiService.event.update(id, { state });
      this.alertSuccess();
      this.modalRef.hide()
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
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
  checkSelect(shop_id) {
    return this.select_ids.includes(shop_id)
  }
  async removeShop(id) {
    this.submittingCheck = true;
    try {
      this.select_ids.splice(this.select_ids.indexOf(id), 1)
      await this.apiService.thema.update(this.thema_id, {
        ids_shop_banner: this.select_ids
      });
      this.submittingCheck = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submittingCheck = false;
    }

    // this.itemsTable.reloadItems();
  }
  async addShop(id) {
    this.submittingCheck = true;
    try {
      console.log("@@ leng", this.select_ids.length)
      if (this.select_ids.length < 20) {
        if (!this.select_ids.includes(id)) {
          this.select_ids.push(id)
        }
        await this.apiService.thema.update(this.thema_id, {
          ids_shop_banner: this.select_ids
        });
      } else {
        this.alertLimit();

      }

      this.submittingCheck = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submittingCheck = false;
    }

    // this.itemsTable.reloadItems();
  }
  async search() {
    this.submitting = true;
    this.query.filter = {
      state: { $in: ["APPROVED"] }
    }
    if (this.searchRef) { clearTimeout(this.searchRef); }
    this.searchRef = setTimeout(async () => {
      // if (!this.keyword && !this.fieldSearch) {
      //   this.alertNotChooseSearchCondition();
      //   this.submitting = false;
      //   return;
      // // }
      // if (!this.keyword || this.keyword === '') {
      //   this.keyword = undefined;
      // } else {
      //   if (this.keyword.length === 36) {
      //     this.query.filter.id = this.keyword;
      //   } else {
      //     this.query.filter.title = { $iLike: `%${this.keyword}%` }
      //   }
      // }
      if (this.option_search === 'id') {
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
    return moment(parseInt(unixtimestamp)).format("YYYY-MM-DD")
  }
  subTimeOpen1(time) {
    return time.substring(0, time.indexOf("~"))
  }
  subTimeOpen2(time) {
    return time.substring(time.indexOf("~") + 1, time.lenght)
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
  alertLimit() {
    return swal({
      title: "Only a maximum of 20 shops can be selected",
      type: 'warning',
      timer: 2000,
    });
  }
  uploadImage(fileInput) {
    this.loadingUploadImage = true;
    try {
      const files = fileInput.target.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadImage(file, 300)
        .then(result => {
          this.images_event.push(result.url)
          this.loadingUploadImage = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeImage(image) {
    this.images_event = this.images_event.filter(function (item) {
      return item !== image
    })
  }
}
