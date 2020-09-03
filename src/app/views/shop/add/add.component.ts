import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { Md5 } from 'ts-md5/dist/md5';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../../services/config/config.service';
import { ShareDataService } from '../../../services/share-data/share-data-service';
import { async } from '@angular/core/testing';
import { html } from './../../../_html_de';
declare var require: any;
// const NodeGeocoder = require('node-geocoder');

declare var $: any;
declare let swal: any;

@Component({
  selector: 'app-add-shop',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddShopComponent implements OnInit {
  @ViewChild('multiSelect') multiSelect;

  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  title: string;
  images: any = [];
  thumbnails: any = [];
  params_category_id: string;
  params_thema_id: string;

  category_id: string;
  themas: any = [];
  thema_id: string = null;
  tag_ids: any = [];
  tags: any = [];
  tags_select: any[] = []
  categories: any
  opening_hours: string;
  contact_phone: string;
  address: string;
  created_by_admin: boolean = true;
  city_id: string;
  district_id: string;
  ward_id: string;
  cities: any = [];
  districts: any = [];
  wards: any = [];
  description: string = html;
  loadingUploadAvatar: boolean = false;
  loadingUploadImage: boolean = false;
  theme_color: string = "#f44336"
  hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ]
  start_time: string = null;
  end_time: string = null;
  badge_image: string = null;
  settings = {};
  public form_tag: FormGroup;

  @ViewChild('fileAvatar') fileAvatarElementRef: ElementRef;
  @ViewChild('fileImage') fileImageElementRef: ElementRef;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private apiService: ApiService,
    private titleService: Title,
    public configService: ConfigService,
    public shareDataService: ShareDataService) {
  }
  async ngOnInit() {
    this.route.params.subscribe(async (params) => {

      this.id = params.id;
      if (params.thema_id) {
        this.thema_id = params.thema_id;
        this.params_thema_id = params.thema_id;
      }
      if (params.category_id) {
        this.params_category_id = params.category_id;
      }
      if (this.id == null) {
        this.isEdit = false;
        this.setDefaultData();
      } else {
        this.isEdit = true;
      }

      if (this.isEdit) {
        await this.setData();
      }
      console.log("log ", this.thema_id)
      const query: any = {
        fields: ["$all"],
        limit: 9999999
      }
      this.themas = await this.apiService.thema.getList({
        query
      });
      this.updateCateList();

      const dataTag = await this.apiService.tag.getList({
        query
      });
      // this.cities = await this.apiService.city.getList({
      //   query
      // });
      // this.listDistrict();
      // this.listWard();
      this.tags = dataTag.map(item => {
        return {
          item_id: item.id,
          item_text: item.name
        }
      });
      // this.tags_select = [
      //   {item_text: "Parking lot", item_id: "1558a660-bf58-11ea-a3ea-5d37b467b530"},
      //   {item_text: "Wifi", item_id: "184abd40-bf58-11ea-a3ea-5d37b467b530"},
      //   {item_text: "Credit card accepted", item_id: "096d0b70-bf58-11ea-a3ea-5d37b467b530"}
      // ];
      console.log("@@@@@tags_select ", this.tags_select)

      this.settings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        enableCheckAll: false,
        selectAllText: 'Select all',
        unSelectAllText: 'Unselect all',
        allowSearchFilter: true,
        limitSelection: -1,
        clearSearchFilter: true,
        maxHeight: 197,
        itemsShowLimit: 4,
        searchPlaceholderText: 'Search',
        noDataAvailablePlaceholderText: 'No info',
        closeDropDownOnSelection: false,
        showSelectedItemsAtTop: false,
        defaultOpen: false
      };
      this.setForm();


    });

  }
  resetForm() {
    this.setForm();
    this.multiSelect.toggleSelectAll();
  }
  setForm() {
    this.form_tag = new FormGroup({
      name: new FormControl(this.tags, Validators.required)
    });
  }
  save() {
    this.tag_ids = []
    this.form_tag.value.name.forEach(element => {
      this.tag_ids.push(element.item_id)
    });
    console.log("tag ", this.tag_ids)
  }
  public onSave(items: any) {
    this.save();
  }
  get f() {
    return this.form_tag.controls;
  }
  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Successfully!' : ((this.configService.lang === 'vn') ? 'Thành công!' : '성공'),
      type: 'success',
      timer: 2000,
    });
  }

  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
  }

  alertErrorFromServer(message) {
    return swal({
      title: (message === "검색한 상점주소가 확인되지 않습니다. 정확한 주소정보를 입력해주세요") ? ((this.configService.lang === 'en') ? 'your shop address not found, please check that your address, city, ward, district are matched!' : ((this.configService.lang === 'vn') ? 'Không tìm thấy địa chỉ cửa hàng của bạn, vui lòng kiểm tra xem địa chỉ, thành phố, phường, quận của bạn có khớp nhau không!' : '검색한 상점주소가 확인되지 않습니다. 정확한 주소정보를 입력해주세요')) : message,
      type: 'warning',
      timer: 2000,
    });
  }

  alertItemNotFound() {
    swal({
      title: 'No information found',
      type: 'warning',
      timer: 2000
    });
  }

  backToList() {
    if (this.params_category_id) {
      this.router.navigate([`/shop/shop-list/${this.params_category_id}`], { relativeTo: this.route });

    } else {
      this.router.navigate(['/shop/shop-list'], { relativeTo: this.route });
    }
  }
  backToThema() {
    this.router.navigate(['/thema/thema-list'], { relativeTo: this.route });

  }
  async updateCateList() {
    const query: any = {
      fields: ["$all"],
      limit: 9999999,
      filter: {
        thema_id: this.thema_id
      }
    }
    this.categories = await this.apiService.category.getList({
      query
    });
  }
  setDefaultData() {
    this.titleService.setTitle('Add new shop');
    this.title = null;
    this.images = [];
    this.thumbnails = []
    this.category_id = null
    this.opening_hours = null;
    this.contact_phone = null;
    this.address = null;
    this.tag_ids = [];
    // this.created_by_admin = true;
    this.city_id = null;
    this.district_id = null;
    this.ward_id = null;
    this.start_time = null;
    this.end_time = null;
    return {
      category_id: this.category_id,
      tag_ids: this.tag_ids,
      name: this.title,
      images: this.images,
      opening_hours: this.opening_hours,
      contact_phone: this.contact_phone,
      address: this.address,
      created_by_admin: this.created_by_admin,
      city_id: this.city_id,
      district_id: this.district_id,
      ward_id: this.ward_id,
      start_time: this.start_time,
      end_time: this.end_time,
      description: this.description,
      thumbnails: this.thumbnails
    };
  }

  async setData() {
    try {
      const data = await this.apiService.shop.getItem(this.id, {
        query: { fields: ['$all', { "category": ["$all"] }] }
      });
      this.thema_id = data.category.thema_id
      this.category_id = data.category_id;
      this.tag_ids = data.tag_ids;
      this.theme_color = data.theme_color;
      this.badge_image = data.badge_image;
      this.thumbnails = data.thumbnails;
      if (this.tag_ids) {
        for (let index = 0; index < this.tag_ids.length; index++) {
          const tag_id = this.tag_ids[index];
          const tag = await this.apiService.tag.getItem(tag_id, {
            query: { fields: ['$all'] }
          });
          this.tags_select.push({
            item_text: tag.name,
            item_id: tag_id
          })
        }
      } else {
        this.tags_select = []
      }
      this.title = data.title;
      this.images = data.images;
      if (!this.images) {
        this.images = []
      }
      this.opening_hours = data.opening_hours;
      this.contact_phone = data.contact_phone;
      this.address = data.address;
      // this.created_by_admin = true;
      this.city_id = data.city_id;
      this.district_id = data.district_id;
      this.ward_id = data.ward_id;
      this.start_time = data.opening_hours.substring(0, 5);
      this.end_time = data.opening_hours.substring(6, data.opening_hours.lenght);
      this.description = data.description
      this.titleService.setTitle(this.title);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  async updateItem(form: NgForm) {
    try {
      this.opening_hours = this.start_time + '~' + this.end_time
      this.images = this.thumbnails.map(item => {
        return item.replace("300", "1980")
      });
      const { category_id, thumbnails, badge_image, theme_color, description, tag_ids, title, images, opening_hours, contact_phone, address, city_id, district_id, ward_id } = this;
      await this.apiService.shop.update(this.id, { category_id, thumbnails, theme_color, description, tag_ids, title, images, badge_image, opening_hours, contact_phone, address });
      this.alertSuccess();
      this.backToList();
      form.reset();

      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }


  async addItem(form: NgForm) {
    try {
      this.opening_hours = this.start_time + '~' + this.end_time
      this.images = this.thumbnails.map(item => {
        return item.replace("300", "1980")
      });
      const { category_id, badge_image, theme_color, description, thumbnails, tag_ids, title, images, opening_hours, contact_phone, address, city_id, district_id, ward_id } = this;
      await this.apiService.shop.add({ category_id, theme_color, thumbnails, description, tag_ids, title, images, badge_image, opening_hours, contact_phone, address, verified: true });
      form.reset();
      this.alertSuccess();
      if (this.params_thema_id) {
        this.backToThema();
      } else {
        this.backToList();
      }
      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }

  async submitUpdate(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.updateItem(form);
    } else {
      this.submitting = false;
      this.alertFormNotValid();
    }
  }

  async submitAdd(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.addItem(form);
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }

  uploadAvatar(fileInput) {
    this.loadingUploadAvatar = true;
    try {
      const files = this.fileAvatarElementRef.nativeElement.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadImage2(file, 300, 1980)
        .then(result => {
          this.images.push(result.high_quality_images[0].url)
          this.thumbnails.push(result.low_quality_images[0].url)
          this.loadingUploadAvatar = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }
  async getPosition() {
    // const res = await geocoder.geocode(this.address);
    console.log("@@$#  ", this.address)
  }
  removeAvatar(image) {
    this.thumbnails = this.thumbnails.filter(function (item) {
      return item !== image
    })

  }
  uploadImage(fileInput) {
    this.loadingUploadImage = true;
    try {
      const files = this.fileImageElementRef.nativeElement.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadImage(file, 300)
        .then(result => {
          this.badge_image = result.url
          this.loadingUploadImage = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeImage() {
    this.badge_image = null
  }
  async listDistrict() {
    let fields: any = ["$all"];
    const query: any = Object.assign({
      fields: fields,
    });
    query.filter = {};
    if (this.city_id) {
      query.filter.city_id = this.city_id;
      query.limit = 99999999
      this.districts = await this.apiService.district.getList({ query });
    }
    // if (this.channel && this.city !== 'Chọn thành phố') {
    //   query.filter.channel = this.channel;
    //   query.filter.city = this.city;

    // }

  }
  async listWard() {
    let fields: any = ["$all"];
    const query: any = Object.assign({
      fields: fields,
    });
    query.filter = {};
    if (this.district_id) {
      query.filter.district_id = this.district_id;
      query.limit = 99999999
      this.wards = await this.apiService.ward.getList({ query });
    }
    // if (this.channel && this.city !== 'Chọn thành phố') {
    //   query.filter.channel = this.channel;
    //   query.filter.city = this.city;

    // }

  }
}
