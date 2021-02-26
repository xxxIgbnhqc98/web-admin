import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { Md5 } from 'ts-md5/dist/md5';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../../services/config/config.service';
import { ShareDataService } from '../../../services/share-data/share-data-service';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';

declare var $: any;
declare let swal: any;

@Component({
  selector: 'app-add-thema',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddThemaComponent implements OnInit {
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  name: string;
  avatar: string;
  loadingUploadAvatar: boolean = false;
  broads_ids: any = [];
  broads: any = [];
  broads_select: any = [];
  settings = {};
  public form: FormGroup;
  @ViewChild('fileAvatar') fileAvatarElementRef: ElementRef;
  @ViewChild('multiSelect') multiSelect;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private apiService: ApiService,
    private titleService: Title,
    public configService: ConfigService,
    public shareDataService: ShareDataService) {
  }
  async ngOnInit() {
    this.broads = [
      {
        item_id: "RECRUIT_BOARD",
        item_text: (this.configService.lang === 'en') ? "recruit board" : ((this.configService.lang === 'vn') ? "Trang tuyển dụng" : '구인 게시판')
      },
      {
        item_id: "RECRUIT_BOARD_2",
        item_text: (this.configService.lang === 'en') ? "job hunting board" : ((this.configService.lang === 'vn') ? "Trang tìm việc" : '구직 게시판')
      },
      {
        item_id: "EVENT_BOARD",
        item_text: (this.configService.lang === 'en') ? "event board" : ((this.configService.lang === 'vn') ? "Trang sự kiện" : '이벤트 게시판')
      },
      {
        item_id: "BULLETIN_BOARD",
        item_text: (this.configService.lang === 'en') ? "bulletin board" : ((this.configService.lang === 'vn') ? "Trang bài viết" : '게시판')
      },
      {
        item_id: "SHOP_SALES_BOARD",
        item_text: (this.configService.lang === 'en') ? "shop sales board" : ((this.configService.lang === 'vn') ? "Trang kinh doanh" : '샵매물 게시판')
      },
    ]
    this.route.params.subscribe(params => {
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
  }
  resetForm() {
    this.setForm();
    this.multiSelect.toggleSelectAll();
  }

  setForm() {
    this.form = new FormGroup({
      name: new FormControl(this.broads, Validators.required)
    });
  }
  public onSave(items: any) {
    this.save();
  }
  save() {
    this.broads_ids = []
    this.form.value.name.forEach(async (element) => {
      await this.broads_ids.push(element.item_id)
    });
    console.log(this.broads_ids)
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
    this.router.navigate(['/thema/thema-list'], { relativeTo: this.route });
  }

  setDefaultData() {
    this.titleService.setTitle('Add new thema');
    this.name = null;
    this.avatar = null;
    this.broads_select = []

    return {
      name: this.name,
      avatar: this.avatar
    };
  }

  async setData() {
    try {
      const data = await this.apiService.thema.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.avatar = data.avatar;
      this.name = data.name;
      this.broads_ids = data.visible_boards
      this.broads_select = []
      if (data.visible_boards.length !== 0) {
        for (let index = 0; index < data.visible_boards.length; index++) {
          const board = data.visible_boards[index];
          this.broads_select.push({
            item_id: board,
            item_text: (board === "RECRUIT_BOARD_2") ? ((this.configService.lang === 'en') ? "job hunting board" : ((this.configService.lang === 'vn') ? "Trang tìm việc" : '구직 게시판')) : (board === "RECRUIT_BOARD") ? ((this.configService.lang === 'en') ? "recruit board" : ((this.configService.lang === 'vn') ? "Trang tuyển dụng" : '구인 게시판')) : (board === "EVENT_BOARD") ? ((this.configService.lang === 'en') ? "event board" : ((this.configService.lang === 'vn') ? "Trang sự kiện" : '이벤트 게시판')) : (board === "BULLETIN_BOARD") ? (this.configService.lang === 'en') ? "bulletin board" : ((this.configService.lang === 'vn') ? "Trang bài viết" : '게시판') : (board === "SHOP_SALES_BOARD") ? (this.configService.lang === 'en') ? "Shop sales board" : ((this.configService.lang === 'vn') ? "Trang kinh doanh" : '샵매물 게시판') : board.toLowerCase().replace("_", " ")
          })
        }
      } else {
        this.broads_select = []
      }
      console.log("@#@#@# ", this.broads_select)
      this.titleService.setTitle(this.name);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  async updateItem(form: NgForm) {
    try {
      const { name } = this;
      await this.apiService.thema.update(this.id, { name, visible_boards: this.broads_ids });
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
      // const { .thema., email, password } = this;
      await this.apiService.thema.add({ name: this.name, visible_boards: this.broads_ids });
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
          this.avatar = result.url;
          this.loadingUploadAvatar = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeAvatar() {
    this.avatar = null;
  }
}
