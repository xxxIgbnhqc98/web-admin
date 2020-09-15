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
import { max } from 'rxjs/operators';

declare var swal: any;
@Component({
  selector: 'app-shop-list',
  templateUrl: 'shop-list.component.html',
  styleUrls: ['./shop-list.component.scss']
})
export class ShopListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { "user": ["$all"] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
  query: any = {
    filter: {
      // state: { $in: ["APPROVED", "PENDING"] }
    }
  };
  option_search: string = 'id';
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
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
  expiration_date: any;
  start_date: any;
  // 
  start_date_1: Date;
  start_time_1: any = '12:00';
  expiration_date_1: Date;
  expiration_time_1: any = '12:00';
  start_time_unix_timestamp: number;
  expiration_time_unix_timestamp: number;
  // 
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
    this.titleService.setTitle('Shop list')
    this.route.params.subscribe(params => {
      this.category_id = params.category_id;
      if (this.category_id) {
        this.query.filter.category_id = this.category_id
      }
    });
  }
  onChangeDate(event) {
    console.log('event12eihiuhg', event)
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
    console.log("@@@ ", this.link_map)

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
  openModalSubTime(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.expired_date = item.expired_date;
    this.modalRef = this.modalService.show(template);
  }
  async submitSubTime(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      try {
        const max_day = Math.ceil((this.expired_date - moment().valueOf()) / 86400000)
        console.log("@@@@ n ", max_day)
        if (this.extra_days > max_day) {
          this.extra_days = max_day
        }
        await this.apiService.shop.editReTime(this.id_update, {
          expired_date: parseInt(this.expired_date.toString()) - (this.extra_days * 86400000)
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
    this.expiration_date = item.expired_date
    this.start_date = item.start_date
    if (item.events.length === 0) {
      this.title_event = null;
      this.description = null;
      this.images_event = [];
      this.value_of_day = [this.currentDate, this.currentDate];
      this.event_id = null
      // 
      // this.start_date_1 = null;
      // this.expiration_date_1 = null;
      // this.start_time_1 = '12:00';
      // this.expiration_time_1 = '12:00';
      // 
    } else {
      this.title_event = item.events[0].title
      this.description = item.events[0].description
      this.value_of_day = [new Date(parseInt(item.events[0].start_time)), new Date(parseInt(item.events[0].end_time))];
      this.images_event = item.events[0].images
      this.event_id = item.events[0].id
      this.state = item.events[0].state
      // 
      // this.start_date_1 = new Date(parseInt(item.events[0].start_time));
      // this.expiration_date_1 = new Date(parseInt(item.events[0].end_time));
      // this.start_time_1 =moment(parseInt(item.events[0].start_time)).format("HH:mm")
      // this.expiration_time_1 = moment(parseInt(item.events[0].end_time)).format("HH:mm")
      // 
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
    const time_end = moment(form.value.value_of_day[1]).valueOf()
    const time_start = moment(form.value.value_of_day[0]).valueOf()
    const temp_exp_date = moment(+this.expiration_date).format('L')
    const temp_str_date = moment(+this.start_date).format('L')
    const exp_date = moment(temp_exp_date).valueOf()
    const str_date = moment(temp_str_date).valueOf()


    // let start_hour = 0;
    // let start_minute = 0;
    // let expiration_hour = 0;
    // let expiration_minute = 0;
    // if (this.start_time_1.split(':').length > 0) {
    //   start_hour = this.start_time_1.split(':')[0];
    // }
    // if (this.start_time_1.split(':').length > 1) {
    //   start_minute = this.start_time_1.split(':')[1];
    // }
    // if (this.expiration_time_1.split(':').length > 0) {
    //   expiration_hour = this.expiration_time_1.split(':')[0];
    // }
    // if (this.expiration_time_1.split(':').length > 1) {
    //   expiration_minute = this.expiration_time_1.split(':')[1];
    // }

    // this.start_time_unix_timestamp = new Date(this.start_date_1.getFullYear(), this.start_date_1.getMonth(),
    //   this.start_date_1.getDate(), start_hour, start_minute, 0).getTime();
    // this.expiration_time_unix_timestamp = new Date(this.expiration_date_1.getFullYear(), this.expiration_date_1.getMonth(),
    //   this.expiration_date_1.getDate(), expiration_hour, expiration_minute, 0).getTime();
    // if(this.start_time_unix_timestamp >= this.expiration_time_unix_timestamp){
    //   this.alertFailedStartEndTime()
    //   this.submitting = false;
    //   return;
    // }
    // 
    if (time_start > time_end) {
      this.alertFailedStartEndTime()
      this.submitting = false;
      return;
    }

    if (time_end <= exp_date && time_start >= str_date) {
      // if (this.expiration_time_unix_timestamp <= this.expiration_date && this.start_time_unix_timestamp >= this.start_date) {
      this.submitting = true;
      console.log(form)
      if (form.valid && this.images_event.length > 0) {
        if (!this.event_id) {
          await this.addItem(form);
        } else {
          await this.updateItem(form);

        }
      } else {
        this.alertFormNotValid();
        this.submitting = false;
      }
    } else {
      this.alertFailedDate()
    }
  }
  async submitDeleteEvent(form: NgForm) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.event.delete(this.event_id);
      this.modalRef.hide()
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async addItem(form: NgForm) {
    try {
      await this.apiService.event.add({
        // title: this.title_event,
        description: this.description,
        images: this.images_event,
        state: "APPROVED",
        // start_time: this.start_time_unix_timestamp,
        // end_time: this.expiration_time_unix_timestamp,
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
        // start_time: this.start_time_unix_timestamp,
        // end_time: this.expiration_time_unix_timestamp,
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
      if (error.error.message === 'your event end time cannot bigger than shop expiration date.') {
        const msg = (this.configService.lang === 'en') ? 'The end time of event can\'t be later than the end time of Post.'
          : ((this.configService.lang === 'vn') ? 'Thời gian kết thúc sự kiện không thể trễ hơn thời gian kết thúc của bài đăng' : '이벤트만료일은  상점만료일을 초과하여 설정할 수  없습니다.')
        this.alertErrorFromServer(msg);
      } else {
        this.alertErrorFromServer(error.error.message);
        console.log(error.error.message);
      }
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
  alertFailedDate() {
    this.value_of_day = [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    return swal({
      title: (this.configService.lang === 'en') ? 'The event period is available only within advertising period of relevant shop' : ((this.configService.lang === 'vn') ? 'Thời gian sự kiện chỉ có sẵn trong khoảng thời gian quảng cáo của cửa hàng có liên quan' : '이벤트 기간은  관련 상점 광고기간 내에만 설정가능합니다.'),
      type: 'warning',
      timer: 3000,
    });
  }
  alertFailedStartEndTime() {
    this.value_of_day = [new Date(), new Date()]
    return swal({
      title: (this.configService.lang === 'en') ? 'Start Time must be earlier than End time' : ((this.configService.lang === 'vn') ? 'Thời gian bắt đầu sự kiện phải sớm hơn thời gian kết thúc sự kiện' : '시작시간은  종료시간보다 늦을 수 없습니다.'),
      type: 'warning',
      timer: 3000,
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
      this.items.next(await this.apiService.shop.getList({ query }));
      this.itemCount = this.apiService.shop.pagination.totalItems;
      this.ref.detectChanges();
      return this.items;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  editItem(item) {
    if (this.category_id) {
      this.router.navigate([`/shop/add/${item.id}/${this.category_id}`,], {
        relativeTo: this.route
      });
    } else {
      this.router.navigate(['/shop/add/', item.id], {
        relativeTo: this.route
      });
    }
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
    console.log("lenght ", item.events.lenght)
    try {
      try {
        if (item.events.length > 0) {
          this.alertErrorFromServer((this.configService.lang === 'en') ? 'There is a EVENT linked to Post you want to delete, Please delete EVENT first!' : ((this.configService.lang === 'vn') ? 'Có một sự kiện được liên kết với Bài đăng mà bạn muốn xóa. Vui lòng xóa EVENT trước!' : '삭제하려는 상점과 연동된 이벤트가 있습니다. 해당 이벤트를 먼저 삭제하여 주시기 바랍니다!'));
          return;

        } else {
          await this.confirmDelete();
        }
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
  async search() {
    this.submitting = true;
    this.query.filter = {
      // state: { $in: ["APPROVED", "PENDING"] }
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
      await this.apiService.shop.deleteAll(ids);
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
  mathRemainingTime(unixtimestamp: any) {
    // return new Date(parseInt(unixtimestamp));
    return (unixtimestamp - moment().valueOf()) / (24 * 60 * 60 * 1000)
  }
  ceilRemainingTime(unixtimestamp: any) {
    return Math.ceil((unixtimestamp - moment().valueOf()) / (24 * 60 * 60 * 1000))
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
  uploadImage(fileInput) {
    this.loadingUploadImage = true;
    try {
      console.log("haha")

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
