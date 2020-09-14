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
  categories_select: any[] = []
  settings = {};
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
    this.route.params.subscribe(async (params) => {
      this.id = params.id;
      if (this.id == null) {
        this.isEdit = false;
        this.setDefaultData();
      } else {
        this.isEdit = true;
      }

      if (this.isEdit) {
        this.setData();
      }
      const query: any = {
        fields: ["$all"],
        limit: 9999999
      }
      this.themas = await this.apiService.thema.getList({
        query
      });
      const dataCate = await this.apiService.category.getList({
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
      name: new FormControl(this.categories, Validators.required)
    });
  }
  save() {
    this.category_ids = []
    console.log("tag ", this.form.value)
    this.form.value.name.forEach(async (element) => {
      await this.category_ids.push(element.item_id)
    });
    console.log("tag 2", this.category_ids)

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

    return {
      name: this.name,
      avatar: this.image,
      thema_id: this.thema_id,
      route_link: this.route_link,
      category_ids: this.category_ids,
      index: this.index
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
      // 
      this.index = data.index
      // 
      if (data.categories.length !== 0) {
        for (let index = 0; index < data.categories.length; index++) {
          const cate = data.categories[index];
          this.categories_select.push({
            item_text: cate.category.name,
            item_id: cate.category_id
          })
        }
      } else {
        this.categories_select = []
      }

      this.titleService.setTitle(this.name);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }
  async changeThema() {
    this.category_ids = [];
    this.categories_select = [];
    const dataCate = await this.apiService.category.getList({
      query: {
        fields: ["$all"],
        filter: {
          thema_id: this.thema_id
        }
      }
    });
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
      const { name, image, thema_id, route_link, category_ids, index } = this;
      if(index < 0){
        this.alertErrorFromServer("Index can not be negative");
        this.submitting = false;
        return;
      }
      if(index > 12){
        this.alertErrorFromServer("Index can not be greater than 12")
        this.submitting = false;
        return;
      }
      await this.apiService.link.update(this.id, { name, image, thema_id, route: route_link, category_ids, index });
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
      const { name, image, thema_id, route_link, category_ids, index } = this;
      if(index < 0){
        this.alertErrorFromServer("Index can not be negative");
        this.submitting = false;
        return;
      }
      if(index > 12){
        this.alertErrorFromServer("Index can not be greater than 12")
        this.submitting = false;
        return;
      }
      await this.apiService.link.add({ name, image, thema_id, route: route_link, category_ids, index });
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
