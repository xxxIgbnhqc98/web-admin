import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { Md5 } from 'ts-md5/dist/md5';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../../services/config/config.service';
import { ShareDataService } from '../../../services/share-data/share-data-service';
import { async } from '@angular/core/testing';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';

declare var $: any;
declare let swal: any;

@Component({
  selector: 'app-add-link',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddLinkComponent implements OnInit {
  @ViewChild('multiSelect') multiSelect;

  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  name: string;
  image: string;
  index: number;
  loadingUploadAvatar: boolean = false;
  themas: any = []
  thema_id: string;
  route_link: string = null;
  category_ids: any = [];
  categories: any = [];
  categories_select: any[] = [];
  user_types_ids: any = [];
  user_types: any = [];
  user_types_select: any = [];
  settings = {};
  geolocation: string = null;
  public form: FormGroup;
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
    this.user_types = [
      {
        item_id: 'BIZ_USER',
        item_text: (this.configService.lang === 'en') ? 'Biz User' : ((this.configService.lang === 'vn') ? 'Biz User' : '기업회원')
      },
      {
        item_id: 'FREE_USER',
        item_text: (this.configService.lang === 'en') ? 'Free User' : ((this.configService.lang === 'vn') ? 'Free User' : '무료회원')
      },
      {
        item_id: 'NON_MEMBER',
        item_text: (this.configService.lang === 'en') ? 'Non User' : ((this.configService.lang === 'vn') ? 'Non User' : '비회원')
      },
      {
        item_id: 'PAID_USER',
        item_text: (this.configService.lang === 'en') ? 'Paid User' : ((this.configService.lang === 'vn') ? 'Paid User' : '유료회원')
      }
    ]
    this.route.params.subscribe(async (params) => {
      this.id = params.id;
      if (this.id == null) {
        this.isEdit = false;
        this.setDefaultData();
      } else {
        this.isEdit = true;
      }
      const query: any = {
        fields: ["$all"],
        limit: 9999999
      }
      let dataCate
      if (this.isEdit) {
        let filter: any = {};
        await this.setData();
        if (this.thema_id !== 'null') {
          filter.thema_id = this.thema_id
        }
        dataCate = await this.apiService.category.getList({
          query: {
            fields: ["$all"],
            filter: filter,
            limit: 9999999
          }
        });

      } else {
        // dataCate = await this.apiService.category.getList({
        //   query
        // });
        dataCate = []
      }

      this.themas = await this.apiService.thema.getList({
        query
      });
      this.categories = dataCate.map(item => {
        return {
          item_id: item.id,
          item_text: item.name
        }
      });
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
    this.form = new FormGroup({
      name: new FormControl(this.categories, Validators.required),
      user_type: new FormControl(this.user_types, Validators.required)
    });
  }

  save() {
    this.user_types_ids = []
    this.form.value.user_type.forEach(async (element) => {
      await this.user_types_ids.push(element.item_id)
    });
  }
  saveCa() {
    this.category_ids = []
    this.form.value.name.forEach(async (element) => {
      await this.category_ids.push(element.item_id)
    });

  }

  public onSaveCa(items: any) {
    this.saveCa();
  }
  public onSave(items: any) {
    this.save();
  }
  get f() {
    return this.form.controls;
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
    this.router.navigate(['/link/link-list'], { relativeTo: this.route });
  }

  setDefaultData() {
    this.titleService.setTitle('Add new link');
    this.name = null;
    this.image = null;
    this.thema_id = null
    this.route_link = null
    this.category_ids = [];
    this.index = null;
    this.geolocation = null;

    return {
      name: this.name,
      avatar: this.image,
      thema_id: this.thema_id,
      route_link: this.route_link,
      category_ids: this.category_ids,
      index: this.index,
      geolocation: this.geolocation
    };
  }

  async setData() {
    try {
      const data = await this.apiService.link.getItem(this.id, {
        query: { fields: ['$all', { "categories": ["$all", { "category": ["$all"] }] }] }
      });
      this.image = data.image;
      this.name = data.name;
      this.thema_id = data.thema_id;
      this.route_link = data.route;
      this.user_types_ids = data.accessible_user_type;
      this.geolocation = data.geolocation_api_type
      // 
      this.index = data.index
      if (data.accessible_user_type.length !== 0) {
        for (let index = 0; index < data.accessible_user_type.length; index++) {
          const user_type = data.accessible_user_type[index];
          this.user_types_select.push({
            item_text: user_type === 'BIZ_USER' ? ((this.configService.lang === 'en') ? 'Biz User' : ((this.configService.lang === 'vn') ? 'Biz User' : '기업회원')) : (user_type === 'FREE_USER' ? ((this.configService.lang === 'en') ? 'Free User' : ((this.configService.lang === 'vn') ? 'Free User' : '무료회원')) : (user_type === 'NON_MEMBER' ? ((this.configService.lang === 'en') ? 'Non User' : ((this.configService.lang === 'vn') ? 'Non User' : '비회원')) : ((this.configService.lang === 'en') ? 'Paid User' : ((this.configService.lang === 'vn') ? 'Paid User' : '유료회원')))),
            item_id: user_type
          })
        }
      } else {
        this.user_types_select = []
      }

      if (data.categories.length !== 0) {
        for (let index = 0; index < data.categories.length; index++) {
          const cate = data.categories[index];
          this.categories_select.push({
            item_text: cate.category.name,
            item_id: cate.category_id
          })
          this.category_ids.push(cate.category_id)
        }
      } else {
        this.categories_select = []
      }
      console.log("data.accessible_user_type ", this.category_ids)
      this.titleService.setTitle(this.name);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }
  async changeBoard() {
    if (this.route_link !== 'null' && (this.route_link === "BULLETIN_BOARD" || this.route_link === "EVENT_BOARD" || this.route_link === "RECRUIT_BOARD" || this.route_link === "RECRUIT_BOARD_2"
      || this.route_link === "SHOP_SALES_BOARD")) {
      this.themas = await this.apiService.thema.getList({
        query: {
          fields: ["$all"],
          filter: {
            visible_boards: { $contains: [this.route_link] }

          },
          limit: 9999999
        }
      });
    } else {
      this.themas = await this.apiService.thema.getList({
        query: {
          fields: ["$all"],
          limit: 9999999
        }
      });
    }

  }
  async changeThema() {
    this.category_ids = [];
    this.categories_select = [];
    let dataCate;
    if (this.thema_id !== 'null') {
      dataCate = await this.apiService.category.getList({
        query: {
          fields: ["$all"],
          filter: {
            thema_id: this.thema_id
          }
        }
      });
    } else {
      dataCate = await this.apiService.category.getList({
        query: {
          fields: ["$all"],
          filter: {

          }
        }
      });
    }

    this.categories = dataCate.map(item => {
      return {
        item_id: item.id,
        item_text: item.name
      }
    });
    console.log("@!#$@$@3 ", dataCate)
  }
  async updateItem(form: NgForm) {
    try {
      let { name, image, thema_id, route_link, category_ids, index, user_types_ids, geolocation } = this;
      console.log('#######', category_ids)
      if (thema_id === 'null') {
        thema_id = null
      }
      if (index < 0) {
        this.alertErrorFromServer("The order of link can not be negative");
        this.submitting = false;
        return;
      }
      if (index > 12) {
        this.alertErrorFromServer("The order of link can not be greater than 12")
        this.submitting = false;
        return;
      }
      if (thema_id && category_ids.length === 0) {
        this.alertFormNotValid();
        this.submitting = false;
        return;
      }
      await this.apiService.link.update(this.id, { name, image, thema_id, route: route_link, category_ids, index, accessible_user_type: user_types_ids, geolocation_api_type: geolocation });
      form.reset();
      this.alertSuccess();
      this.backToList();
      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }


  async addItem(form: NgForm) {
    try {
      // this.password = new Md5().appendStr(this.password_show).end();
      let { name, image, thema_id, route_link, category_ids, index, user_types_ids, geolocation } = this;
      if (thema_id === 'null') {
        thema_id = null
      }
      if (index < 0) {
        this.alertErrorFromServer("Index can not be negative");
        this.submitting = false;
        return;
      }
      if (index > 12) {
        this.alertErrorFromServer("Index can not be greater than 12")
        this.submitting = false;
        return;
      }
      if (category_ids.length === 0) {
        this.alertFormNotValid();
        this.submitting = false;
        return;
      }
      await this.apiService.link.add({ name, image, thema_id, route: route_link, category_ids, accessible_user_type: user_types_ids, index, geolocation_api_type: geolocation });
      form.reset();
      this.alertSuccess();
      this.backToList();
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
          this.image = result.url;
          this.loadingUploadAvatar = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeAvatar() {
    this.image = null;
  }
}
