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
import * as _ from 'lodash';
import { title } from 'process';
import { NgxSpinnerService } from "ngx-spinner";

declare var $: any;

declare var swal: any;
@Component({
  selector: 'app-shop-list',
  templateUrl: 'shop-list.component.html',
  styleUrls: ['./shop-list.component.scss']
})
export class ShopListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { "courses": ["$all", { "prices": ["$all"] }] }, { "user": ["$all"] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
  query: any = {
    filter: {
      state: { $notIn: ["REJECTED", "EXPIRED"] }
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
  loadingUploadExcel: boolean = false;
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
  days: number = 30;
  sub_days: number = 0;
  // 
  start_date_1: Date;
  start_time_1: any = '12:00';
  expiration_date_1: Date;
  expiration_time_1: any = '12:00';
  start_time_unix_timestamp: number;
  expiration_time_unix_timestamp: number;
  loading_api: boolean = false;
  page_list_reviews: number = 1;
  listReviewOfConversation: any = [];
  shop_id: string;
  limit_list_reviews: number = 10;
  count_list_reviews: number = 0;
  load_more: boolean = false;
  default_limit: number = (this.configService.limitActiveShop === null || this.configService.limitActiveShop === '' || this.configService.limitActiveShop === 'null') ? 50 : parseInt(this.configService.limitActiveShop);
  default_page: number = (this.configService.pageActiveShop === null || this.configService.pageActiveShop === '' || this.configService.pageActiveShop === 'null') ? 1 : parseInt(this.configService.pageActiveShop);
  listShopFiltered: any = []
  listShop: any = []
  lastSubmitSingerId: string;
  isShowingCategoryDropDown: boolean = false
  option_order: string = null;
  themas: any;
  thema_id: string = (this.configService.themaFilter === null || this.configService.themaFilter === '') ? "null" : this.configService.themaFilter
  // 
  item_more_info: any;
  payment_menthod_text: string;

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
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.category_id = params.category_id;
    });
    await this.getShopList();
    this.themas = await this.apiService.thema.getList({
      query: {
        fields: ["$all"],
        limit: 9999999,
        filter: {
        }
      }
    });
    this.default_limit = (this.configService.limitActiveShop === null || this.configService.limitActiveShop === '' || this.configService.limitActiveShop === 'null') ? 50 : parseInt(this.configService.limitActiveShop);
    this.default_page = (this.configService.pageActiveShop === null || this.configService.pageActiveShop === '' || this.configService.pageActiveShop === 'null') ? 1 : parseInt(this.configService.pageActiveShop);

    this.thema_id = (this.configService.themaFilter === null || this.configService.themaFilter === '') ? "null" : this.configService.themaFilter;
    if (this.thema_id === 'null') {
      this.itemsTable.reloadItems();
    }
    this.titleService.setTitle('Shop list')

  }
  filterThema() {
    this.configService.themaFilter = this.thema_id
    this.itemsTable.reloadItems();
  }
  async changeOptionOrder() {
    this.itemsTable.reloadItems();
  }
  async getShopList() {
    try {
      this.loading_api = true;
      this.listShop = await this.apiService.shop.getList({
        query: {
          fields: ['$all'],
          page: 1,
          limit: 50
        }
      })
      this.ref.detectChanges();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  getShopFromId(id) {
    let title = '';
    if (this.listShop) {
      this.listShop.forEach(shop => {
        if (shop.id === id) {
          title = shop.title;
        }
      });
    }
    return title;
  }
  mathRoundPrice(price: number) {
    return Math.round(price)
  }
  closeDropdownUser() {
    // document.getElementById("myDropdown").classList.remove("show");
    document.getElementById("myDropdown").classList.add("hide");
  }
  onShopSearch() {
    const input: any = document.getElementById("myInput");
    this.filterFunction(input.value);
  }
  async filterFunction(keyword: string) {
    if (!keyword || keyword.length === 0) {
      this.listShopFiltered = this.items.value;
      return;
    }
    const newFilteredShopList = [];
    try {
      this.query.filter.title = { $iLike: `%${keyword}%` }
      this.query.fields = ["$all"]
      this.listShop = await this.apiService.shop.getList({ query: this.query })
    } catch (error) {
    }
    if (this.listShop.length) {
      this.listShop.forEach(shop => {
        if (shop.title.toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
          newFilteredShopList.push(shop);
        }
      });
    }
    this.listShopFiltered = newFilteredShopList;
  }
  async onShopClick(shop) {
    this.shop_id = shop.id;
    console.log(this.shop_id)
    this.router.navigate([`/shop/add/${this.shop_id}`,], {
      relativeTo: this.route
    });
  }
  changeSearchHandler() {
    this.listShopFiltered = []
  }
  showDropdown() {
    if (this.isShowingCategoryDropDown) {
      return;
    }
    document.getElementById("search-section").classList.add("show");
    document.getElementById("singerListWrapper").style.overflowY = "scroll";
    document.getElementById("shop_id").blur();
    document.getElementById("myInput").focus();

    // Auto scroll to the previous chosen singer_id
    if (this.lastSubmitSingerId && this.lastSubmitSingerId !== '') {
      setTimeout(() => {
        const singerItem: any = document.getElementById('singer_' + this.lastSubmitSingerId);
        const singerWrapper: any = document.getElementById('singerListWrapper');
        singerWrapper.scrollTop = singerItem.offsetTop - 100;
      }, 500);
    }

    setTimeout(() => {
      this.filterFunction(""); //Show all singers
    }, 100);

  }
  //
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
    if (user.old_shop) {
      this.link_map = `https://maps.google.com/maps?q=${user.old_shop.latitude},${user.old_shop.longitude}&output=embed`

    } else {
      this.link_map = `https://maps.google.com/maps?q=${user.latitude},${user.longitude}&output=embed`

    }
    console.log("@@@ ", this.link_map)

  }
  parsePaymentMenthod(items: any) {
    let string
    for (let index = 0; index < items.length; index++) {
      string = string + ", " + items[index];

    }
    return string
  }
  openModalAddTime(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.expired_date = item.expired_date;
    this.modalRef = this.modalService.show(template);
  }
  openModalPrices(template: TemplateRef<any>, item) {
    this.item_more_info = item
    let string = ''
    for (let index = 0; index < item.payment_methods.length; index++) {
      let text = item.payment_methods[index]
      if (this.configService.lang === 'kr') {
        if (text === 'MEET_AND_CASH') {
          text = '????????? ????????????'
        }
        if (text === 'MEET_AND_TRANSFER') {
          text = '????????? ????????????'

        }
        if (text === 'MEET_AND_CARD') {
          text = '????????? ????????????'

        }
        if (text === 'IN_APP_PAYMENT') {
          text = '????????? ??????(?????????)'

        }
      } else {
        if (text === 'MEET_AND_CASH') {
          text = 'Meet and cash'
        }
        if (text === 'MEET_AND_TRANSFER') {
          text = 'Meet and transfer'

        }
        if (text === 'MEET_AND_CARD') {
          text = 'Meet and card'

        }
        if (text === 'IN_APP_PAYMENT') {
          text = 'In app payment'

        }
      }
      string = string + ", " + text;

    }
    this.payment_menthod_text = string
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
  openModalAddTimeAll(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  openModalSubTimeAll(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
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
  async submitAddTimeAll(form: NgForm) {
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
      await this.apiService.shop.addDateAll({ days: this.days }, ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
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
      await this.apiService.shop.subDateAll({ days: this.sub_days }, ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
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
  // Review

  async getListReviewOfConversation(template, item) {
    try {
      this.loading_api = true;
      this.page_list_reviews = 1;
      this.shop_id = item.id

      this.modalRef = this.modalService.show(template);
      this.listReviewOfConversation = await this.apiService.review.getList({
        query: {
          fields: ['$all', { 'user': ['$all', '$paranoid'] }, { 'review_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
          filter: { shop_id: this.shop_id, parent_id: null },
          order: [['created_at_unix_timestamp', 'DESC']],
          limit: this.limit_list_reviews,
          page: this.page_list_reviews
        }
      });
      this.listReviewOfConversation.forEach(element => {
        element.review_childs = _.orderBy(element.review_childs, ['created_at_unix_timestamp'], ['asc']);
      });
      console.log('listReviewOfConversation', this.listReviewOfConversation)

      // this.listReviewOfConversation.reverse();
      this.count_list_reviews = this.apiService.review.pagination.totalItems;
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
    await this.loadMoreListReview();
    this.load_more = false;
  }
  async loadMoreListReview() {
    try {
      if (this.listReviewOfConversation.length < this.count_list_reviews) {
        this.page_list_reviews = this.page_list_reviews + 1;
        const res = await this.apiService.review.getList({
          query: {
            fields: ['$all', { 'user': ['$all', '$paranoid'] }, { 'review_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
            filter: { shop_id: this.shop_id, parent_id: null },
            order: [['created_at_unix_timestamp', 'DESC']],
            limit: this.limit_list_reviews,
            page: this.page_list_reviews
          }
        });
        this.listReviewOfConversation.forEach(element => {
          element.review_childs = _.orderBy(element.review_childs, ['created_at_unix_timestamp'], ['asc']);
        });
        const old_res: any = this.listReviewOfConversation;
        this.listReviewOfConversation = [...old_res, ...res];
        // this.listReviewOfConversation.reverse();
      }
    } catch (error) {

    }
  }
  async deleteReview(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.review.delete(item.id);
      this.reloadAfterDeleteReview();
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async reloadAfterDeleteReview() {
    try {
      this.loading_api = true;
      this.page_list_reviews = 1;
      this.listReviewOfConversation = await this.apiService.review.getList({
        query: {
          fields: ['$all', { 'user': ['$all', '$paranoid'] }, { 'review_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
          filter: { shop_id: this.shop_id, parent_id: null },
          order: [['created_at_unix_timestamp', 'DESC']],
          limit: this.limit_list_reviews,
          page: this.page_list_reviews
        }
      });
      this.listReviewOfConversation.forEach(element => {
        element.review_childs = _.orderBy(element.review_childs, ['created_at_unix_timestamp'], ['asc']);
      });
      // this.listReviewOfConversation.reverse();
      this.count_list_reviews = this.apiService.review.pagination.totalItems;
      this.ref.detectChanges();
      await this.autoScroll();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  // ////////////////
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
        if (this.extra_days >= max_day) {
          this.extra_days = max_day - 1
          this.alertSubTime();
          this.submitting = false;
          return;
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
      // this.value_of_day = [this.currentDate, this.currentDate];
      this.event_id = null
      // 
      this.start_date_1 = this.currentDate;
      this.expiration_date_1 = this.currentDate;
      // this.start_time_1 = '12:00';
      // this.expiration_time_1 = '12:00';
      // 
    } else {
      this.title_event = item.events[0].title
      this.description = item.events[0].description
      // this.value_of_day = [new Date(parseInt(item.events[0].start_time)), new Date(parseInt(item.events[0].end_time))];
      this.images_event = item.events[0].images
      this.event_id = item.events[0].id
      this.state = item.events[0].state
      // 
      this.start_date_1 = new Date(parseInt(item.events[0].start_time));
      this.expiration_date_1 = new Date(parseInt(item.events[0].end_time));
      // this.start_time_1 =moment(parseInt(item.events[0].start_time)).format("HH:mm")
      // this.expiration_time_1 = moment(parseInt(item.events[0].end_time)).format("HH:mm")
      // 
    }
    this.modalRef = this.modalService.show(template);
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'H??y nh???p ?????y ????? th??ng tin' : '?????? ????????? ???????????? ???????????????'),
      type: 'warning',
      timer: 2000,
    });
  }
  alertSubTime() {
    return swal({
      title: (this.configService.lang === 'en') ? 'The date to decrease can\'t be bigger than remaining date' : ((this.configService.lang === 'vn') ? 'Ng??y gi???m kh??ng ???????c l???n h??n ng??y c??n l???i' : '??????????????????  ?????? ?????????????????? ?????? ????????? ??? ????????????.'),
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
  async submitAddEvent(form: NgForm) {
    // const time_end = moment(form.value.value_of_day[1]).valueOf()
    // const time_start = moment(form.value.value_of_day[0]).valueOf()
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
  async updateItem(form: NgForm) {
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
  async reloadItems(params) {
    const { limit, page, offset, sortBy, sortAsc } = params;
    this.query.limit = limit;

    console.log("para ne ", params)
    this.query.page = page;

    if (this.thema_id !== "null") {
      this.itemFields[2].category.push({ "$filter": { "thema_id": this.thema_id } })

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
      if (!this.option_order || this.option_order === "null") {
        this.query.order = [['geolocation_api_type', 'DESC']]
      } else {
        this.query.order = [['expired_date', this.option_order], ['updated_at', 'DESC']]
      }
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
      if (this.category_id) {
        this.query.filter.category_id = this.category_id
        delete this.query.filter.state
      }
      console.log("this.query ", this.query)
      console.log("this.query.page ", this.query.page)
      console.log("this.query.limit ", this.query.limit)
      this.configService.limitActiveShop = this.query.limit.toString();
      this.configService.pageActiveShop = this.query.page ? this.query.page.toString() : 1;
      this.spinner.show();
      this.items.next(await this.apiService.shop.getList({ query }));
      this.spinner.hide();
      this.itemCount = this.apiService.shop.pagination.totalItems;
      this.ref.detectChanges();
      return this.items;
    } catch (error) {
      console.log("eeee ", error)
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
  getReview(shop_id) {
    this.router.navigate(['/shop/review-list/' + shop_id], {
      relativeTo: this.route
    });
  }
  async alertDeleteSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete successfully' : ((this.configService.lang === 'vn') ? 'X??a th??nh c???ng' : '??????????????? ?????????????????????.'),
      type: 'success',
      timer: 1000,
    });
  }
  async alertRemoveAddDateSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'remove ad expiration date successfully' : ((this.configService.lang === 'vn') ? 'G??? b??? ng??y h???t h???n qu???ng c??o th??nh c???ng' : '???????????? ??????????????? ?????????????????????.'),
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
  async confirmRemoveAddDate() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Remove Add date' : ((this.configService.lang === 'vn') ? 'G??? b??? ng??y qu???ng c??o' : '????????? ??????'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to remove?' : ((this.configService.lang === 'vn') ? 'B???n c?? ch???c ch???n mu???n g??? kh??ng?' : '????????? ????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
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
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
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
  async search() {
    this.submitting = true;
    if (this.category_id) {
      this.query.filter.category_id = this.category_id
    } else {
      this.query.filter = {
        state: { $notIn: ["REJECTED", "EXPIRED"] }
      }
    }
    this.itemFields = ['$all', { "courses": ["$all", { "prices": ["$all"] }] }, { "user": ["$all"] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];

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
      if (this.keyword) {
        if (this.option_search === 'id') {
          if (this.keyword.length === 36) {
            this.query.filter.id = this.keyword;
          } else {
            this.itemFields = ['$all', { "courses": ["$all", { "prices": ["$all"] }] }, { "user": ["$all", { "$filter": { username: { $iLike: `%${this.keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
          }
        } else if (this.option_search === 'nickname') {
          this.itemFields = ['$all', { "courses": ["$all", { "prices": ["$all"] }] }, { "user": ["$all", { "$filter": { nickname: { $iLike: `%${this.keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
        } else if (this.option_search === 'gmail') {
          this.itemFields = ['$all', { "courses": ["$all", { "prices": ["$all"] }] }, { "user": ["$all", { "$filter": { email: { $iLike: `%${this.keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
        } else if (this.option_search === 'title') {
          this.query.filter.title = { $iLike: `%${this.keyword}%` }
        } else if (this.option_search === 'phone_number') {
          this.query.filter.contact_phone = { $iLike: `%${this.keyword}%` }
        }
      }

      if (this.thema_id !== "null") {
        this.itemFields[2].category.push({ "$filter": { "thema_id": this.thema_id } })
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
  async removeAddDateAll() {
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
        await this.confirmRemoveAddDate();
      } catch (err) {
        return;
      }
      await this.apiService.shop.removeReTime(ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertRemoveAddDateSuccess();
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
  async downloadExcel() {
    try {
      this.loadingExportExcel = true;
      const data = await this.apiService.shop.downLoadExcel({
        query: {
          filter: { "state": { "$notIn": ["REJECTED", "EXPIRED"] } },
          limit: 999999,
          fields: ["$all", { "courses": ["$all", { "prices": ["$all"] }] }, { "user": ["$all"] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }],
          order: [["geolocation_api_type", "DESC"]]
        }
      });
      console.log("@#@#@ ", data)
      window.open(data.url, '_blank');
      // this.excelService.exportAsExcelFile(data_map, `category_list`);
      this.loadingExportExcel = false;
    } catch (error) {
      this.loadingExportExcel = false;
      console.log('error: ', error);
    }
  }
  uploadExcel(fileInput) {
    this.loadingUploadExcel = true;

    try {
      console.log("haha")

      const files = fileInput.target.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadExcel(file)
        .then(result => {
          this.alertSuccess();
          this.itemsTable.reloadItems();
          // this.images_event.push(result.url)
          this.loadingUploadExcel = false;
        });
    } catch (err) {
      this.alertFailed();

      console.log('Kh??ng ??p ???????c h??nh');
    }
  }
  getDateFromUnixTimestamp(unixtimestamp: any) {
    return moment(parseInt(unixtimestamp)).format("YYYY-MM-DD")
  }
  mathRemainingTime(unixtimestamp: any) {
    // return new Date(parseInt(unixtimestamp))
    return (moment(new Date(parseInt(unixtimestamp))).endOf('day').valueOf() - moment().endOf('day').valueOf()) / (24 * 60 * 60 * 1000)
  }
  ceilRemainingTime(unixtimestamp: any) {
    return Math.floor((moment(new Date(parseInt(unixtimestamp))).endOf('day').valueOf() - moment().valueOf()) / (24 * 60 * 60 * 1000))
  }

  subTimeOpen1(time) {
    return time.substring(0, time.indexOf("~"))
  }
  subTimeOpen2(time) {
    return time.substring(time.indexOf("~") + 1, time.lenght)
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
}
