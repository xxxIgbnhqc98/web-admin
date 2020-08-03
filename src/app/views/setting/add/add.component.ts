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
  loadingUploadAvatar: boolean = false;
  themas: any = []
  thema_id: string;
  route_link: string = null;
  boards_ids: any = [];
  boards: any = [];
  boards_select: any[] = []
  settings = {};
  user_type: string;
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
        this.backToList();
      } else {
        this.isEdit = true;
      }

      if (this.isEdit) {
        await this.setData();
      }

      this.boards = [
        {
          item_id: 'SHOP_LIST_BOARD',
          item_text: 'SHOP_LIST_BOARD'
        },
        {
          item_id: 'DISTANCE_ORDER_BOARD',
          item_text: 'DISTANCE_ORDER_BOARD'
        },
        {
          item_id: 'EVENT_BOARD',
          item_text: 'EVENT_BOARD'
        },
        {
          item_id: 'BULLETIN_BOARD',
          item_text: 'BULLETIN_BOARD'
        }
      ]

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
      name: new FormControl(this.boards, Validators.required)
    });
  }
  save() {
    this.boards_ids = []
    console.log("element ",this.form.value.name)
    this.form.value.name.forEach(async (element) => {

      await this.boards_ids.push(element)
    });
    console.log("tag 2", this.boards_ids)

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
    this.router.navigate(['/setting/setting-user-permission-list'], { relativeTo: this.route });
  }

  // setDefaultData() {
  //   this.titleService.setTitle('Add new link');
  //   this.name = null;
  //   this.image = null;
  //   this.thema_id = null
  //   this.route_link = null
  //   this.category_ids = [];

  //   return {
  //     name: this.name,
  //     avatar: this.image,
  //     thema_id: this.thema_id,
  //     route_link: this.route_link,
  //     category_ids: this.category_ids
  //   };
  // }

  async setData() {
    try {
      const data = await this.apiService.settingUserPermission.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.user_type = data.user_type
      if (data.boards.length !== 0) {
        for (let index = 0; index < data.boards.length; index++) {
          const board = data.boards[index];
          this.boards_select.push({
            item_text: board,
            item_id: board
          })
        }
      } else {
        this.boards_select = []
      }
      this.titleService.setTitle(this.user_type);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  async updateItem(form: NgForm) {
    try {
      const { boards_ids } = this;
      console.log("bb ",boards_ids)
      await this.apiService.settingUserPermission.update(this.id, { boards: boards_ids });
      form.reset();
      this.alertSuccess();
      this.backToList();
      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }


  // async addItem(form: NgForm) {
  //   try {
  //     // this.password = new Md5().appendStr(this.password_show).end();
  //     const { name, image, thema_id, route_link, category_ids } = this;
  //     await this.apiService.settingUserPermission.add({ name, image, thema_id, route: route_link, category_ids });
  //     form.reset();
  //     this.alertSuccess();
  //     this.backToList();
  //     this.submitting = false;
  //   } catch (error) {
  //     this.alertErrorFromServer(error.error.message);
  //     this.submitting = false;
  //   }
  // }

  async submitUpdate(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.updateItem(form);
    } else {
      await this.updateItem(form);

      this.submitting = false;
      // this.alertFormNotValid();
    }
  }

  // async submitAdd(form: NgForm) {
  //   this.submitting = true;
  //   if (form.valid) {
  //     await this.addItem(form);
  //   } else {
  //     this.alertFormNotValid();
  //     this.submitting = false;
  //   }
  // }

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
