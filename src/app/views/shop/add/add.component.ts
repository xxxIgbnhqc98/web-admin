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
  category_id: string;
  tag_ids: any = [];
  tags: any = [];
  tags_select: any[] = []
  categories: any
  min_price: number;
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
  hours = [
    'AM 00:00', 'AM 01:00', 'AM 02:00', 'AM 03:00', 'AM 04:00', 'AM 05:00', 'AM 06:00', 'AM 07:00', 'AM 08:00', 'AM 09:00', 'AM 10:00', 'AM 11:00', 'PM 12:00', 'PM 13:00', 'PM 14:00', 'PM 15:00', 'PM 16:00', 'PM 17:00', 'PM 18:00', 'PM 19:00', 'PM 20:00', 'PM 21:00', 'PM 22:00', 'PM 23:00', 'PM 24:00'
  ]
  start_time: string = null;
  end_time: string = null;
  settings = {};
  public form_tag: FormGroup;

  @ViewChild('fileAvatar') fileAvatarElementRef: ElementRef;

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
      if (this.id == null) {
        this.isEdit = false;
        this.setDefaultData();
      } else {
        this.isEdit = true;
      }

      if (this.isEdit) {
        await this.setData();
      }
      const query: any = {
        fields: ["$all"],
        limit: 9999999
      }
      this.categories = await this.apiService.category.getList({
        query
      });
      const dataTag = await this.apiService.tag.getList({
        query
      });
      this.cities = await this.apiService.city.getList({
        query
      });
      this.listDistrict();
      this.listWard();
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
      title: message,
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

    this.router.navigate(['/shop/shop-list'], { relativeTo: this.route });
  }

  setDefaultData() {
    this.titleService.setTitle('Add new shop');
    this.title = null;
    this.images = [];
    this.min_price = null;
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
      min_price: this.min_price,
      opening_hours: this.opening_hours,
      contact_phone: this.contact_phone,
      address: this.address,
      created_by_admin: this.created_by_admin,
      city_id: this.city_id,
      district_id: this.district_id,
      ward_id: this.ward_id,
      start_time: this.start_time,
      end_time: this.end_time,
      description: this.description
    };
  }

  async setData() {
    try {
      const data = await this.apiService.shop.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.category_id = data.category_id;
      this.tag_ids = data.tag_ids;
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
      this.min_price = data.min_price;
      this.opening_hours = data.opening_hours;
      this.contact_phone = data.contact_phone;
      this.address = data.address;
      // this.created_by_admin = true;
      this.city_id = data.city_id;
      this.district_id = data.district_id;
      this.ward_id = data.ward_id;
      this.start_time = data.opening_hours.substring(0, 8);
      this.end_time = data.opening_hours.substring(11, data.opening_hours.lenght);
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
      this.opening_hours = this.start_time + ' ~ ' + this.end_time
      const { category_id, description, tag_ids, title, images, min_price, opening_hours, contact_phone, address, city_id, district_id, ward_id } = this;
      await this.apiService.shop.update(this.id, { category_id, description, tag_ids, title, images, min_price, opening_hours, contact_phone, address, city_id, district_id, ward_id });
      // form.reset();
      this.alertSuccess();
      // this.backToList();
      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }


  async addItem(form: NgForm) {
    try {
      this.opening_hours = this.start_time + ' ~ ' + this.end_time
      const { category_id, description, tag_ids, title, images, min_price, opening_hours, contact_phone, address, city_id, district_id, ward_id } = this;
      await this.apiService.shop.add({ category_id, description, tag_ids, title, images, min_price, opening_hours, contact_phone, address, city_id, district_id, ward_id, verified: true });
      form.reset();
      this.alertSuccess();
      // this.backToList();
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
      const result = this.apiService.fileUploader.uploadImage(file, 300)
        .then(result => {
          this.images.push(result.url)
          this.loadingUploadAvatar = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeAvatar(image) {
    this.images = this.images.filter(function (item) {
      return item !== image
    })
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
