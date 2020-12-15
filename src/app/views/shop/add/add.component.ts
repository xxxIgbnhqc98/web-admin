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
import { BehaviorSubject } from 'rxjs';

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
  public editorOptions: Object = {
    charCounterCount: true,
    imageUploadParam: 'image_param',
    imageUploadURL: 'assets/upload_image',
    imageUploadParams: { id: 'my_editor' },
    imageUploadMethod: 'POST',
    imageMaxSize: 5 * 1024 * 1024,
    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
    events: {
      'froalaEditor.initialized': function () {
        console.log('initialized');
      },
      'froalaEditor.image.beforeUpload': function (e, editor, images) {
        if (images.length) {
          // Create a File Reader.
          const reader = new FileReader();
          // Set the reader to insert images when they are loaded.
          reader.onload = (ev) => {
            const result = ev.target['result'];
            editor.image.insert(result, null, null, editor.image.get());
            console.log(ev, editor.image, ev.target['result'])
          };
          // Read image as base64.
          reader.readAsDataURL(images[0]);
        }
        // Stop default upload chain.
        return false;
      }

    },
    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineClass', 'inlineStyle', 'paragraphStyle', 'lineHeight', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'fontAwesome', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'getPDF', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    placeholderText: ' ',
    key: 'EA1C1C2G2H1A17vB3D2D1B1E5A4D4I1A16B11iC-13xjtH-8hoC-22yzF4jp=='
  };
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
  address_2: string;
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
  short_description: string;
  min_price: string;
  kakaolink_url: string;
  theme_color: string = "#f44336"
  hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ]
  hours1 = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ]
  start_time: string = null;
  end_time: string = null;
  badge_text: string = null;
  badge_color: string = "#f44336";

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
    // ////////////////
    document.getElementById("myDropdown").classList.add("hide");
    await this.getListUser();
    console.log('listUser', this.listUser)
    // ///////////////////
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
  // ////////////////////////
  isShowingCategoryDropDown: boolean = false
  user_id: string;
  lastSubmitSingerId: string;
  loading_api: boolean = false;
  // listUser: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  listUser: any = [];
  listUserFiltered: any = [];
  listDuplicateImages: any = [];
  query: any = {
    fields: ["$all"],
    filter: {
      account_type: "BIZ_USER"
    }
  };
  getUserNickNameFromId(id) {
    let name = '';
    if (this.listUser) {
      this.listUser.forEach(user => {
        if (user.id === id) {
          name = user.nickname;
        }
      });
    }
    return name;
  }
  async filterFunction(keyword: string) {
    if (!keyword || keyword.length === 0) {
      this.listUserFiltered = this.listUser;
      return;
    }
    const newFilteredUserList = [];
    try {
      if (keyword.length === 36) {
        this.query.filter.id = keyword
      } else {
        this.query.filter.nickname = { $iLike: `%${keyword}%` }
        this.query.filter = {
          '$or': [
            {
              nickname: { $iLike: `%${keyword}%` }
            },
            { username: { $iLike: `%${keyword}%` } },
          ]
        }
      }
      this.listUser = await this.apiService.user.getList({ query: this.query })
    } catch (error) {
    }
    console.log('listUser', this.listUser)
    if (this.listUser.length) {
      this.listUser.forEach(user => {
        if (user.username.toUpperCase().indexOf(keyword.toUpperCase()) > -1 || user.id === keyword || user.nickname.toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
          newFilteredUserList.push(user);
        }
      });
    }

    this.listUserFiltered = newFilteredUserList;
    console.log('listUserFiltered', this.listUserFiltered)

  }

  closeDropdownUser() {
    document.getElementById("myDropdown").classList.remove("show");
    document.getElementById("myDropdown").classList.add("hide");
  }
  onUserSearch() {
    const input: any = document.getElementById("myInput");
    this.filterFunction(input.value);
  }
  async onUserClick(user) {
    if (this.user_id && this.user_id !== user.id) {
      try {
        await this.confirChangeUser();
      } catch (error) {
        return;
      }
    }
    this.user_id = user.id;

    // if (this.type_category !== 'GERNE') {
    //     this.listSelectedCategoryIds = [];
    //     this.type_category = 'GERNE';
    //     this.getListCate(this.type_category);
    //     this.release_date = null;
    // }
    document.getElementById("myDropdown").classList.remove("show");
  }
  // async onChangeName() {
  //   this.listDuplicateImages = [];
  //   const qr: any = {
  //       limit: 5,
  //       fields: ['avartar'],
  //       filter: { name: this.name }
  //   }
  //   if (this.user_id) {
  //       qr.filter.user_id = this.user_id
  //   }
  //   console.log("@@@## ", this.user_id)
  //   const all_singer_with_the_same_name = await this.apiService.album.getList({
  //       query: qr
  //   });

  //   this.listDuplicateImages = all_singer_with_the_same_name.map((album: any) => {
  //       console.log("@#$% ", album.thumbnail)
  //       return album.thumbnail;
  //   });
  // }
  async getListUser() {
    try {
      this.loading_api = true;
      this.listUser = await this.apiService.user.getList({
        query: {
          fields: ['$all'], filter: {
            account_type: "BIZ_USER"
          }, page: 1, limit: 50, order: [["created_at_unix_timestamp", "desc"]]
        }
      })
      this.ref.detectChanges();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  showDropdown() {
    if (this.isShowingCategoryDropDown) {
      return;
    }

    document.getElementById("myDropdown").classList.add("show");
    document.getElementById("user_id").blur();
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
  // //////////////////////////////
  onChangeStartTime(event) {
    this.hours1 = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
    ]
    const index = this.hours.indexOf(event.target.value) + 1
    this.hours1 = this.hours1.splice(index)
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

  async confirChangeUser() {
    return await swal({
      text: (this.configService.lang === 'en') ? 'Are you sure to change the owner of shop?' : ((this.configService.lang === 'vn') ? 'Bạn có chắc chắn thay đổi chủ sở hữu của cửa hàng' : '상점주를 변경하시겠습니까?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
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
  alertErrorFromServerOwner(message) {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please remove relevant Event before transferring the ownership' : ((this.configService.lang === 'vn') ? 'Vui lòng xóa Sự kiện có liên quan trước khi chuyển quyền sở hữu' : '상점 소유권을 이전하기 위해서는 관련 이벤트를 삭제해야 합니다.'),
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
    this.address_2 = null;
    this.tag_ids = [];
    // this.created_by_admin = true;
    this.city_id = null;
    this.district_id = null;
    this.ward_id = null;
    this.start_time = null;
    this.end_time = null;
    this.short_description = null;
    this.min_price = '1000';
    this.kakaolink_url = null;
    return {
      category_id: this.category_id,
      tag_ids: this.tag_ids,
      name: this.title,
      images: this.images,
      opening_hours: this.opening_hours,
      contact_phone: this.contact_phone,
      address: this.address,
      address_2: this.address_2,
      created_by_admin: this.created_by_admin,
      city_id: this.city_id,
      district_id: this.district_id,
      ward_id: this.ward_id,
      start_time: this.start_time,
      end_time: this.end_time,
      description: this.description,
      thumbnails: this.thumbnails,
      short_description: this.short_description,
      min_price: this.min_price,
      kakaolink_url: this.kakaolink_url
    };
  }

  async setData() {
    try {
      const data = await this.apiService.shop.getItem(this.id, {
        query: { fields: ['$all', { "category": ["$all"] }] }
      });
      this.user_id = data.user_id
      this.thema_id = data.category.thema_id
      this.category_id = data.category_id;
      this.tag_ids = data.tag_ids;
      this.theme_color = data.theme_color;
      this.badge_text = data.badge_text;
      this.badge_color = data.badge_color;
      this.thumbnails = data.thumbnails;
      this.short_description = data.short_description;
      this.min_price = data.min_price;
      this.kakaolink_url = data.kakaolink_url;
      if (this.tag_ids) {
        for (let index = 0; index < this.tag_ids.length; index++) {
          const tag_id = this.tag_ids[index];
          try {
            const tag = await this.apiService.tag.getItem(tag_id, {
              query: { fields: ['$all'] }
            });
            this.tags_select.push({
              item_text: tag.name,
              item_id: tag_id
            })
          } catch (err) {
            this.tags_select = this.tags_select
          }

        }
      }
      this.title = data.title;
      this.images = data.images;
      if (!this.images) {
        this.images = []
      }
      this.opening_hours = data.opening_hours;
      this.contact_phone = data.contact_phone;
      this.address = data.address;
      this.address_2 = data.address_2;

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
        return item.replace("300", "1024")
      });
      const { short_description, min_price, kakaolink_url, category_id, thumbnails, badge_text, badge_color, theme_color, description, tag_ids, title, images, opening_hours, contact_phone, address, address_2, city_id, district_id, ward_id } = this;
      await this.apiService.shop.update(this.id, { short_description, min_price, kakaolink_url, category_id, thumbnails, theme_color, description, tag_ids, title, images, badge_text, badge_color, opening_hours, contact_phone, address, address_2, user_id: this.user_id });
      this.alertSuccess();
      this.backToList();
      form.reset();

      this.submitting = false;
    } catch (error) {
      if (error.error.message === "Please remove relevant Event before transferring the ownership") {
        this.alertErrorFromServerOwner(error.error.message);
      } else {
        this.alertErrorFromServer(error.error.message);
      }
      this.submitting = false;
    }
  }


  async addItem(form: NgForm) {
    try {
      this.opening_hours = this.start_time + '~' + this.end_time
      this.images = this.thumbnails.map(item => {
        return item.replace("300", "1024")
      });
      const { short_description, min_price, kakaolink_url, category_id, badge_text, badge_color, theme_color, description, thumbnails, tag_ids, title, images, opening_hours, contact_phone, address, address_2, city_id, district_id, ward_id } = this;
      await this.apiService.shop.add({ short_description, min_price, kakaolink_url, category_id, theme_color, thumbnails, description, tag_ids, title, images, badge_text, badge_color, opening_hours, contact_phone, address, address_2, verified: true, user_id: this.user_id });
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
      const result = this.apiService.fileUploader.uploadImage2(file, 300, 1024)
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
          // this.badge_image = result.url
          this.loadingUploadImage = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeImage() {
    // this.badge_image = null
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
