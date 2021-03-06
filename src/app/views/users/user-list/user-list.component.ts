import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
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
  shop_id: string;
  extra_day: number = 30;
  post_expired_date: number;
  account_type: string = (this.configService.userTypeFilter === null || this.configService.userTypeFilter === '') ? "null" : this.configService.userTypeFilter;
  jump_limit: number = 0;
  zoom_image: string;
  add_jump_limit: number = 1;
  expired_date: number = 30;
  days: number = 30;
  sub_days: number = 0;
  type_shop: string = null;
  extra_days: number = 30;
  listHistories: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCountListHistories: number = 0;
  listShop: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCountListShop: number = 0;
  shop_id_event: string;
  event_id: string;
  currentDate: Date = new Date();
  value_of_day: any = [];
  state: string = null;
  expiration_date: any;
  start_date: any;
  title_event: string;
  description: string;
  images_event: any = []
  loadingUploadImage: boolean = false;
  start_date_1: Date;
  start_time_1: any = '12:00';
  expiration_date_1: Date;
  expiration_time_1: any = '12:00';
  start_time_unix_timestamp: number;
  expiration_time_unix_timestamp: number;
  memoItem: any
  group: string = null
  group_ids: any = [];
  groups: any = [];
  groups_select: any[] = []
  default_limit: number = (this.configService.limitActiveShop === null || this.configService.limitActiveShop === '' || this.configService.limitActiveShop === 'null') ? 10 : parseInt(this.configService.limitActiveShop);
  default_page: number = (this.configService.pageActiveShop === null || this.configService.pageActiveShop === '' || this.configService.pageActiveShop === 'null') ? 1 : parseInt(this.configService.pageActiveShop);
  settings: any = {}
  public form_group: FormGroup;

  @ViewChild('itemsTable') itemsTable: DataTable;
  @ViewChild('itemsTableListShop') itemsTableListShop: DataTable;
  @ViewChild('multiSelect') multiSelect;
  itemsTableShop: DataTable;

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
    private spinner: NgxSpinnerService,
  ) { }

  async ngOnInit() {
    console.log(this.items)
    this.titleService.setTitle('User list')
    this.groups = [
      {
        item_id: '1???',
        item_text: '1???'
      },
      {
        item_id: '2???',
        item_text: '2???'
      },
      {
        item_id: '3???',
        item_text: '3???'
      },
      {
        item_id: '4???',
        item_text: '4???'
      },
      {
        item_id: '5???',
        item_text: '5???'
      },
      {
        item_id: '6???',
        item_text: '6???'
      },
      {
        item_id: '7???',
        item_text: '7???'
      },
      {
        item_id: '8???',
        item_text: '8???'
      },
      {
        item_id: '9???',
        item_text: '9???'
      },
      {
        item_id: '10???',
        item_text: '10???'
      }
    ]
    this.default_limit = (this.configService.limitUser === null || this.configService.limitUser === '' || this.configService.limitUser === 'null') ? 10 : parseInt(this.configService.limitUser);
    this.default_page = (this.configService.pageUser === null || this.configService.pageUser === '' || this.configService.pageUser === 'null') ? 1 : parseInt(this.configService.pageUser);

    this.account_type = (this.configService.userTypeFilter === null || this.configService.userTypeFilter === '') ? "null" : this.configService.userTypeFilter;
    if (this.account_type === 'null') {
      this.itemsTable.reloadItems();
    }
    console.log("sddasd ", this.account_type)
    this.settings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      selectAllText: 'Select all',
      unSelectAllText: 'Unselect all',
      allowSearchFilter: false,
      limitSelection: -1,
      clearSearchFilter: true,
      maxHeight: 197,
      itemsShowLimit: 1,
      searchPlaceholderText: 'Search',
      noDataAvailablePlaceholderText: 'No info',
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false
    };
    this.setForm();
  }
  resetForm() {
    this.setForm();
    this.multiSelect.toggleSelectAll();
  }
  setForm() {
    this.form_group = new FormGroup({
      name: new FormControl(this.groups, Validators.required)
    });
  }
  save() {
    this.group_ids = []
    this.form_group.value.name.forEach(element => {
      this.group_ids.push(element)
    });
    console.log("group ", this.group_ids)
  }
  public onSave(items: any) {
    this.save();
  }
  get f() {
    return this.form_group.controls;
  }
  filterUserType() {
    this.configService.userTypeFilter = this.account_type
    this.itemsTable.reloadItems();
  }
  openModalEvent(template: TemplateRef<any>, item) {
    this.shop_id_event = item.id
    this.expiration_date = item.expired_date
    this.start_date = item.start_date
    if (item.events.length === 0) {
      this.title_event = null;
      this.description = null;
      this.images_event = [];
      this.event_id = null
      this.start_date_1 = this.currentDate;
      this.expiration_date_1 = this.currentDate;
      // 
    } else {
      this.title_event = item.events[0].title
      this.description = item.events[0].description
      this.images_event = item.events[0].images
      this.event_id = item.events[0].id
      this.state = item.events[0].state
      this.start_date_1 = new Date(parseInt(item.events[0].start_time));
      this.expiration_date_1 = new Date(parseInt(item.events[0].end_time));
    }
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-location-shop modal-lg-location' }));
  }
  openModalZoomImage(template: TemplateRef<any>, item) {
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-location-shop modal-lg-location' }));
    this.zoom_image = item
  }
  openModalSubTimeAll(template: TemplateRef<any>, dataTable) {
    this.itemsTableShop = dataTable
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-location-shop modal-lg-location' }));
  }
  openModalAddTimeAll(template: TemplateRef<any>, dataTable) {
    this.itemsTableShop = dataTable
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-location-shop modal-lg-location' }));
  }
  openModal(template: TemplateRef<any>, user) {
    this.modalRef = this.modalService.show(template);
    this.link_map = `https://maps.google.com/maps?q=${user.posts[0].latitude},${user.posts[0].longitude}&output=embed`
    console.log("@@@ ", this.link_map)

  }
  openModalSubTime(template: TemplateRef<any>, item) {
    this.shop_id = item.id
    this.expired_date = item.expired_date;
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-location-shop modal-lg-location' }));
  }
  openModalAddTimeShop(template: TemplateRef<any>, item) {
    this.shop_id = item.id
    this.expired_date = item.expired_date;
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-location-shop modal-lg-location' }));
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
  openModalMemo(template: TemplateRef<any>, item) {
    this.memoItem = item
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-history modal-lg' }));
  }
  openModalHistory(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-history modal-lg' }));
  }
  openModalShop(template: TemplateRef<any>, item, type_shop) {
    this.id_update = item.id
    this.type_shop = type_shop
    this.query.limit = 10;
    this.query.page = 1;

    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-shop modal-lg-shop' }));
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


  async reloadListShop(params) {
    const { limit, offset, sortBy, sortAsc } = params;
    this.query.limit = limit;
    this.query.offset = offset;
    this.query.order = sortBy ? [[sortBy, sortAsc ? 'ASC' : 'DESC']] : null;
    await this.getListShop();
  }
  async getListShop() {
    this.listShop = new BehaviorSubject<any[]>([]);
    this.itemCountListShop = 0
    console.log("tua ne")
    const query = Object.assign({
      fields: ['$all', { "user": ["$all"] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }]
    }, this.query);
    query.filter = {
      user_id: this.id_update,
      state: (this.type_shop === 'active') ? { $notIn: ["REJECTED", "EXPIRED"] } : { $in: ["EXPIRED"] }
    }


    this.listShop.next(await this.apiService.shop.getList({ query }));
    this.itemCountListShop = this.apiService.shop.pagination.totalItems;
    this.ref.detectChanges();
    return this.listShop;
  }
  onSelectShop(params) {
    console.log("nhan ne", params)
  }
  mathRemainingTime(unixtimestamp: any) {
    // return new Date(parseInt(unixtimestamp))
    return (moment(new Date(parseInt(unixtimestamp))).endOf('day').valueOf() - moment().endOf('day').valueOf()) / (24 * 60 * 60 * 1000)
  }
  ceilRemainingTime(unixtimestamp: any) {
    return Math.floor((moment(new Date(parseInt(unixtimestamp))).endOf('day').valueOf() - moment().valueOf()) / (24 * 60 * 60 * 1000))
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
  async submitAddTime(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.addItem(form);
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  async deleteAllShop(itemsTableListShop) {
    if (itemsTableListShop.selectedRows.length === 0) {
      return;
    }
    const rows = itemsTableListShop.selectedRows;
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
      itemsTableListShop.selectAllCheckbox = false;
      // itemsTableListShop.reloadItems();
      await this.getListShop();

      this.alertDeleteSuccess();
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }
  async submitAddTimeAll(form: NgForm) {
    console.log("tau ne ", this.itemsTableShop)
    if (this.itemsTableShop.selectedRows.length === 0) {
      return;
    }
    const rows = this.itemsTableShop.selectedRows;
    const ids = [];
    rows.forEach(row => {
      row.item.deleting = true;
      ids.push(row.item.id);
    });
    try {
      await this.apiService.shop.addDateAll({ days: this.days }, ids);
      this.itemsTableShop.selectAllCheckbox = false;
      // itemsTableListShop.reloadItems();
      await this.getListShop();
      this.alertSuccess();
      this.modalRef.hide()

    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }
  async submitSubTimeAll(form: NgForm) {
    if (this.itemsTableShop.selectedRows.length === 0) {
      return;
    }
    const rows = this.itemsTableShop.selectedRows;
    const ids = [];
    rows.forEach(row => {
      row.item.deleting = true;
      ids.push(row.item.id);
    });
    try {
      await this.apiService.shop.subDateAll({ days: this.sub_days }, ids);
      this.itemsTableShop.selectAllCheckbox = false;
      // this.itemsTableShop.reloadItems();
      await this.getListShop();

      this.alertSuccess();
      this.modalRef.hide()

    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }
  async submitAddTimeShop(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      try {
        const date: number = moment().valueOf()
        if (this.expired_date < date) {
          this.expired_date = date
        }
        await this.apiService.shop.editReTime(this.shop_id, {
          expired_date: parseInt(this.expired_date.toString()) + (this.extra_days * 86400000)
        });

        this.alertSuccess();
        this.modalRef.hide()
        this.submitting = false;
        // this.itemsTableListShop.reloadItems();
        await this.getListShop();
      } catch (error) {
        this.alertErrorFromServer(error.error.message);
        this.submitting = false;
      }
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  async submitSubTime(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      try {
        const max_day = Math.ceil((this.expired_date - moment().valueOf()) / 86400000)
        console.log("@@@@ n ", max_day)
        if (this.extra_days >= max_day) {
          this.extra_days = max_day - 1
          this.alertSubTime();
          this.submitting = false;
          return;
        }
        await this.apiService.shop.editReTime(this.shop_id, {
          expired_date: parseInt(this.expired_date.toString()) - (this.extra_days * 86400000)
        });

        this.alertSuccess();
        this.modalRef.hide()
        this.submitting = false;
        // this.itemsTableListShop.reloadItems();
        await this.getListShop();
      } catch (error) {
        this.alertErrorFromServer(error.error.message);
        this.submitting = false;
      }
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  alertSubTime() {
    return swal({
      title: (this.configService.lang === 'en') ? 'The date to decrease can\'t be bigger than remaining date' : ((this.configService.lang === 'vn') ? 'Ng??y gi???m kh??ng ???????c l???n h??n ng??y c??n l???i' : '??????????????????  ?????? ?????????????????? ?????? ????????? ??? ????????????.'),
      type: 'warning',
      timer: 2000,
    });
  }
  openModalLocationShop(template: TemplateRef<any>, user) {
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-location-shop modal-lg-location' }));
    if (user.old_shop) {
      this.link_map = `https://maps.google.com/maps?q=${user.old_shop.latitude},${user.old_shop.longitude}&output=embed`

    } else {
      this.link_map = `https://maps.google.com/maps?q=${user.latitude},${user.longitude}&output=embed`

    }
    console.log("@@@ ", this.link_map)

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
  async reloadItems(params) {
    const { limit, offset, sortBy, sortAsc, page } = params;
    this.query.limit = limit;
    this.query.page = page;
    // this.query.filter = {
    //   $or: [
    //     {
    //       host_register_status: "ACCEPT"
    //     }, {
    //       guest_register_status: "ACCEPT"
    //     }
    //   ]
    // }
    if (this.account_type !== null && this.account_type !== 'null') {
      this.query.filter.account_type = this.account_type
    }
    this.query.offset = offset;
    this.query.order = sortBy ? [
      [sortBy, sortAsc ? 'ASC' : 'DESC']
    ] : null;
    if (!sortBy && !sortAsc) {
      this.query.order = [['updated_at', 'DESC']]
    }
    await this.getItems();
  }
  arrayGroupToText(array: any) {
    let text = ''
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      text = text + `${element}, `
    }
    return text.substring(0, text.length - 2)
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
  openListPenaltiesModal(template: TemplateRef<any>, item) {
    this.chosenUser = item;
    this.chosenUser.penaltys.sort((b: any, a: any) => (a.start_date_unix_timestamp > b.start_date_unix_timestamp) ? 1 : ((b.start_date_unix_timestamp > a.start_date_unix_timestamp) ? -1 : 0));
    this.modalRef = this.modalService.show(template);
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
      this.configService.limitUser = this.query.limit.toString();
      this.configService.pageUser = this.query.page ? this.query.page.toString() : 1;
      console.log("???? ", this.configService.limitUser)
      console.log("???? ", this.configService.pageUser)

      this.items.next(await this.apiService.user.getList({ query }));
      this.spinner.hide();
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
  editItemShop(item) {
    this.modalRef.hide()
    this.router.navigate(['/shop/add/', item.id], {
      relativeTo: this.route
    });
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
  async deleteShop(item) {
    console.log("lenght ", item.events.lenght)
    try {
      try {
        if (item.events.length > 0) {
          this.alertErrorFromServer((this.configService.lang === 'en') ? 'There is a EVENT linked to Post you want to delete, Please delete EVENT first!' : ((this.configService.lang === 'vn') ? 'C?? m???t s??? ki???n ???????c li??n k???t v???i B??i ????ng m?? b???n mu???n x??a. Vui l??ng x??a EVENT tr?????c!' : '??????????????? ????????? ????????? ???????????? ????????????. ?????? ???????????? ?????? ???????????? ????????? ????????????!'));
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
      if (this.account_type !== null && this.account_type !== 'null') {
        this.query.filter.account_type = this.account_type;
      }
      if (this.group_ids.length > 0) {
        const or = []
        for (let index = 0; index < this.group_ids.length; index++) {
          const group = this.group_ids[index];
          or.push(
            {
              groups: { $contains: [group] }
            }
          )

        }
        console.log("@#@ ", or)
        this.query.filter.$and = [{
          $or: or
        }]
        // this.q uery.filter.groups = { $contains: this.group_ids };
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
    try {
      const time = moment(parseInt(unixtimestamp)).format("YYYY-MM-DD")
      if (time === 'Invalid date') {
        return null
      } else {
        return time
      }
    } catch (error) {
      return null
    }

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
  uploadImage(fileInput) {
    this.loadingUploadImage = true;
    try {
      console.log("haha")

      const files = fileInput.target.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadImage(file, 1024)
        .then(result => {
          this.images_event.push(result.url)
          this.loadingUploadImage = false;
        });
    } catch (err) {
      console.log('Kh??ng ??p ???????c h??nh');
    }
  }

  removeImage(image) {
    this.images_event = this.images_event.filter(function (item) {
      return item !== image
    })
  }
  async submitAddEvent(form: NgForm) {
    const temp_exp_date = moment(+this.expiration_date).format('L')
    const temp_str_date = moment(+this.start_date).format('L')
    const exp_date = moment(temp_exp_date).valueOf()
    const str_date = moment(temp_str_date).valueOf()
    this.expiration_time_unix_timestamp = moment(this.expiration_date_1).valueOf()
    let temp_start_time = moment().format('L')
    this.start_time_unix_timestamp = moment(temp_start_time).valueOf()
    if (this.expiration_time_unix_timestamp <= exp_date && this.start_time_unix_timestamp >= str_date) {
      // if (this.expiration_time_unix_timestamp <= this.expiration_date && this.start_time_unix_timestamp >= this.start_date) {
      if (this.start_time_unix_timestamp > this.expiration_time_unix_timestamp) {
        this.alertFailedStartEndTime()
        this.submitting = false;
        return;
      }
      this.submitting = true;
      console.log(form)
      if (form.valid && this.images_event.length > 0) {
        if (!this.event_id) {
          await this.addItemEvent(form);
        } else {
          await this.updateItemEvent(form);

        }
      } else {
        this.alertFormNotValid();
        this.submitting = false;
      }
    } else {
      this.alertFailedDate()
    }
  }
  alertFailedDate() {
    this.value_of_day = [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
    return swal({
      title: (this.configService.lang === 'en') ? 'The event period is available only within advertising period of relevant shop' : ((this.configService.lang === 'vn') ? 'Th???i gian s??? ki???n ch??? c?? s???n trong kho???ng th???i gian qu???ng c??o c???a c???a h??ng c?? li??n quan' : '????????? ?????????  ?????? ?????? ???????????? ????????? ?????????????????????.'),
      type: 'warning',
      timer: 3000,
    });
  }
  alertFailedStartEndTime() {
    this.value_of_day = [new Date(), new Date()]
    return swal({
      title: (this.configService.lang === 'en') ? 'Start Time must be earlier than End time' : ((this.configService.lang === 'vn') ? 'Th???i gian b???t ?????u s??? ki???n ph???i s???m h??n th???i gian k???t th??c s??? ki???n' : '???????????????  ?????????????????? ?????? ??? ????????????.'),
      type: 'warning',
      timer: 3000,
    });
  }
  async addItemEvent(form: NgForm) {
    try {
      await this.apiService.event.addEvent({
        // title: this.title_event,
        description: this.description,
        images: this.images_event,
        state: "APPROVED",
        // start_time: this.start_time_unix_timestamp,
        end_time: this.expiration_time_unix_timestamp,
        start_time: moment().valueOf(),
        // end_time: moment(this.value_of_day[1]).valueOf(),
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
  async updateItemEvent(form: NgForm) {
    console.log(this.value_of_day)
    try {
      await this.apiService.event.update(this.event_id, {
        title: this.title_event,
        description: this.description,
        images: this.images_event,
        // state: "APPROVED",
        // start_time: this.start_time_unix_timestamp,
        end_time: this.expiration_time_unix_timestamp,
        start_time: moment().valueOf(),
        // end_time: moment(this.value_of_day[1]).valueOf(),
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
          : ((this.configService.lang === 'vn') ? 'Th???i gian k???t th??c s??? ki???n kh??ng th??? tr??? h??n th???i gian k???t th??c c???a b??i ????ng' : '?????????????????????  ?????????????????? ???????????? ????????? ???  ????????????.')
        this.alertErrorFromServer(msg);
      } else {
        this.alertErrorFromServer(error.error.message);
        console.log(error.error.message);
      }
      this.submitting = false;
    }
  }
  async alertCloneShop() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'shop cloning' : ((this.configService.lang === 'vn') ? 'Nh??n b???n c???a h??ng' : '????????????'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to clone this shop?' : ((this.configService.lang === 'vn') ? 'B???n c?? mu???n Nh??n b???n c???a h??ng?' : '????????? ????????? ?????????????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  async cloneShop(shop_id) {
    try {
      try {
        await this.alertCloneShop();
      } catch (error) {
        return;
      }
      await this.apiService.shop.cloneShop(shop_id);
      this.itemsTable.reloadItems();
      this.alertSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  checkItemIsImage(string) {
    console.log("hahahaha ", string)
    string = string.toLowerCase()
    if (string.includes('.png') || string.includes('.jpg') || string.includes('.jpeg') || string.includes('.gif')) {
      return true
    } else {
      return false
    }
  }
  getFileName(string) {
    return string.substring(string.indexOf('file'), string.lenght)
  }
}
