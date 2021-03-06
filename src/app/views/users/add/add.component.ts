import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { Md5 } from 'ts-md5/dist/md5';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../../services/config/config.service';
import { ShareDataService } from '../../../services/share-data/share-data-service';
import * as moment from 'moment'
import { NgxSpinnerService } from "ngx-spinner";

declare var $: any;
declare let swal: any;

@Component({
  selector: 'app-add-user',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddUserComponent implements OnInit {
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  email: string;
  nickname: string;
  phone: string;
  avatar: string;
  username: string;
  account_type: string;
  event_type: string;
  post_limit: number;
  post_limit_min: number;
  memo: string;
  show_shop_tag: boolean = false;
  loadingUploadAvatar: boolean = false;
  paid_user_expiration_date: any;
  isEditInAppUser: boolean = false;
  fullname: string;
  password: any;
  password_show: string;
  editPass: boolean = false;
  msgCheckUsername: string = null;
  group: string = '1번';
  depositor: string;
  contact: string;
  deposit_date: any;
  deposit_amount: string;
  exposure_bulletin_board: string;
  start_date: any;
  uniqueness: string;
  attachments: any;
  settings: any = {}
  public form_group: FormGroup;
  rangeDate: any
  // group_ids: any = [];
  groups: any = [];

  group_list: any = [
    {
      item_id: '1번',
      item_text: '1번'
    },
    {
      item_id: '2번',
      item_text: '2번'
    },
    {
      item_id: '3번',
      item_text: '3번'
    },
    {
      item_id: '4번',
      item_text: '4번'
    },
    {
      item_id: '5번',
      item_text: '5번'
    },
    {
      item_id: '6번',
      item_text: '6번'
    },
    {
      item_id: '7번',
      item_text: '7번'
    },
    {
      item_id: '8번',
      item_text: '8번'
    },
    {
      item_id: '9번',
      item_text: '9번'
    },
    {
      item_id: '10번',
      item_text: '10번'
    }
  ]
  groups_select: any[] = []
  @ViewChild('fileAvatar') fileAvatarElementRef: ElementRef;
  @ViewChild('fileAttachments') fileAttachmentsElementRef: ElementRef;
  @ViewChild('multiSelect') multiSelect;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private apiService: ApiService,
    private titleService: Title,
    public configService: ConfigService,
    public shareDataService: ShareDataService,
    private spinner: NgxSpinnerService) {
  }
  async ngOnInit() {
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
      allowSearchFilter: false,
      limitSelection: -1,
      clearSearchFilter: true,
      maxHeight: 197,
      itemsShowLimit: 10,
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
      name: new FormControl(this.group_list, Validators.required)
    });
  }
  save() {
    this.groups = []
    this.form_group.value.name.forEach(element => {
      this.groups.push(element)
    });
    console.log("group ", this.groups)
  }
  public onSave(items: any) {
    this.save();
  }
  get f() {
    return this.form_group.controls;
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
  alertExpDate() {
    return swal({
      title: 'Expiration date must be earlier than Current date',
      type: 'warning',
      timer: 2000
    });
  }

  backToList() {
    this.router.navigate(['/users/user-list'], { relativeTo: this.route });
  }
  changeStateEditPass() {
    this.editPass = true
  }
  setDefaultData() {
    this.titleService.setTitle('Add new user');
    this.email = null;
    this.nickname = null;
    this.phone = null;
    this.avatar = null;
    this.username = null;
    this.event_type = null;
    this.memo = null;
    this.post_limit = 1;
    this.post_limit_min = 1;
    this.paid_user_expiration_date = new Date()
    this.group = null;
    this.depositor = null;
    this.contact = null;
    this.deposit_date = null;
    this.deposit_amount = null;
    this.exposure_bulletin_board = null;
    this.start_date = null;
    this.uniqueness = null;
    this.attachments = [];
    this.rangeDate = []
    this.groups = [];
    return {
      email: this.email,
      nickname: this.nickname,
      phone: this.phone,
      avatar: this.avatar,
      username: this.username,
      event_type: this.event_type,
      memo: this.memo,
      post_limit: this.post_limit,
      post_limit_min: this.post_limit_min,
      paid_user_expiration_date: this.paid_user_expiration_date,
      group: this.group,
      depositor: this.depositor,
      contact: this.contact,
      deposit_date: this.deposit_date,
      deposit_amount: this.deposit_amount,
      exposure_bulletin_board: this.exposure_bulletin_board,
      start_date: this.start_date,
      uniqueness: this.uniqueness,
      attachments: this.attachments,
      rangeDate: this.rangeDate,
      groups: this.groups

    };
  }

  async setData() {
    try {
      const data = await this.apiService.user.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.email = data.email;
      this.avatar = data.avatar;
      this.nickname = data.nickname;
      this.phone = data.phone;
      this.username = data.username;
      this.account_type = data.account_type;
      this.event_type = data.event_type;
      this.post_limit = data.post_limit;
      this.show_shop_tag = data.show_shop_tag;
      this.memo = data.memo;
      this.group = data.group;
      this.depositor = data.depositor;
      this.contact = data.contact;
      this.deposit_date = data.deposit_date;
      this.deposit_amount = data.deposit_amount;
      this.exposure_bulletin_board = data.exposure_bulletin_board;
      this.start_date = data.start_date;
      this.uniqueness = data.uniqueness;
      this.attachments = data.attachments ? data.attachments : [];
      this.post_limit_min = data.current_active_post + data.current_pending_post;
      this.paid_user_expiration_date = data.paid_user_expiration_date !== null ?
        new Date(parseInt(data.paid_user_expiration_date)) : new Date();
      this.isEditInAppUser = (data.login_type === 'INAPP') ? true : false
      this.groups = data.groups;

      if (this.groups) {
        for (let index = 0; index < this.groups.length; index++) {
          const group = this.groups[index];
          try {
            this.groups_select.push({
              item_text: group,
              item_id: group
            })
          } catch (err) {
            this.groups = this.groups
          }

        }
      }
      this.titleService.setTitle(this.nickname);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }
  setPostLimitMin(min) {
    if (this.post_limit <= this.post_limit_min) {
      this.post_limit = this.post_limit_min
    }
  }
  async updateItem(form: NgForm) {
    try {
      if (moment(this.paid_user_expiration_date).valueOf() < moment().hour(0).minute(0).second(0).valueOf()) {
        //   this.alertExpDate();
        //   this.submitting = false;
        this.paid_user_expiration_date = new Date()
        //   return;
      }
      this.paid_user_expiration_date = moment(this.paid_user_expiration_date).valueOf()
      // this.deposit_date = moment(this.deposit_date).valueOf()
      // this.start_date = moment(this.rangeDate[0]).valueOf()
      this.uniqueness = this.memo



      if (this.password_show && this.editPass === true) {
        this.password = new Md5().appendStr(this.password_show).end();
        const { group, groups, depositor, contact, deposit_date, deposit_amount, exposure_bulletin_board, start_date, uniqueness, attachments, password, account_type, event_type, post_limit, show_shop_tag, memo, paid_user_expiration_date } = this;
        await this.apiService.user.update(this.id, { group, groups, depositor, contact, deposit_date, deposit_amount, exposure_bulletin_board, start_date, uniqueness, attachments, password, account_type, event_type, post_limit, show_shop_tag, memo, paid_user_expiration_date });
      } else {
        const { group, groups, depositor, contact, deposit_date, deposit_amount, exposure_bulletin_board, start_date, uniqueness, attachments, account_type, event_type, post_limit, show_shop_tag, memo, paid_user_expiration_date } = this;
        await this.apiService.user.update(this.id, { group, groups, depositor, contact, deposit_date, deposit_amount, exposure_bulletin_board, start_date, uniqueness, attachments, account_type, event_type, post_limit, show_shop_tag, memo, paid_user_expiration_date });
      }


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
      this.password = new Md5().appendStr(this.password_show).end();
      this.paid_user_expiration_date = moment(this.paid_user_expiration_date).valueOf()
      // this.deposit_date = moment(this.deposit_date).valueOf()
      // this.start_date = moment(this.rangeDate[0]).valueOf()
      // this.end_date = moment(this.rangeDate[1]).valueOf()
      this.uniqueness = this.memo
      const { group, groups, depositor, contact, deposit_date, deposit_amount, exposure_bulletin_board, start_date, uniqueness, attachments, fullname, avatar, phone, account_type, event_type, email, password, username, nickname, post_limit, memo } = this;
      await this.apiService.user.add({ group, groups, depositor, contact, deposit_date, deposit_amount, exposure_bulletin_board, start_date, uniqueness, attachments, avatar, phone, account_type, event_type: "B", post_limit, password, username, nickname, email: username, memo });
      form.reset();
      this.alertSuccess();
      this.backToList();
      this.submitting = false;
    } catch (error) {
      if (error.error.message.includes(', vui lòng chọn username khác')) {
        let msg;
        (this.configService.lang === 'en') ? msg = '[EMAIL (ID)] already exists plz choose another email address'
          : ((this.configService.lang === 'vn')
            ? msg = '[EMAIL (ID)] đã tồn tại, vui lòng chọn [EMAIL (ID)] khác' :
            msg = '[EMAIL (ID)] 는 이미 존재하는 아이디입니다. 다른 이메일을 등록해주세요')
        this.alertErrorFromServer(msg);
      } else {
        this.alertErrorFromServer(error.error.message);
      }
      this.submitting = false;
    }
  }
  async checkUserName() {
    this.msgCheckUsername = null
    if (this.username.length < 2) {
      this.msgCheckUsername = 'username must be 2 or more characters'
    } else {
      const data = await this.apiService.user.getList({
        query: {
          limit: 1,
          fields: ['username'],
          filter: {
            username: this.username
          }
        }
      });
      if (data.length > 0) {
        let msg;
        (this.configService.lang === 'en') ? msg = '[EMAIL (ID)] already exists plz choose another email address'
          : ((this.configService.lang === 'vn')
            ? msg = '[EMAIL (ID)] đã tồn tại, vui lòng chọn [EMAIL (ID)] khác' :
            msg = '[EMAIL (ID)] 는 이미 존재하는 아이디입니다. 다른 이메일을 등록해주세요')
        this.msgCheckUsername = msg
      }
    }
    console.log("this.msgCheckUsername ",this.msgCheckUsername)
  }
  async submitUpdate(form: NgForm) {
    this.submitting = true;
    if (form.valid && this.groups.length > 0) {
      await this.updateItem(form);
    } else {
      this.submitting = false;
      this.alertFormNotValid();
    }
  }

  async submitAdd(form: NgForm) {
    this.submitting = true;
    if (form.valid && this.groups.length > 0) {
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
  uploadFile(fileInput) {
    this.loadingUploadAvatar = true;
    try {
      const files = this.fileAttachmentsElementRef.nativeElement.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadFile(file)
        .then(result => {
          this.attachments.push(result.url)
          this.loadingUploadAvatar = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeFile(image) {
    this.attachments = this.attachments.filter(function (item) {
      return item !== image
    })

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
