import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
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

  fullname: string;
  password: any;
  password_show: string;


  @ViewChild('fileAvatar') fileAvatarElementRef: ElementRef;

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
      paid_user_expiration_date: this.paid_user_expiration_date
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
      this.post_limit_min = data.current_active_post + data.current_pending_post;
      this.paid_user_expiration_date = data.paid_user_expiration_date !== null ?
        new Date(parseInt(data.paid_user_expiration_date)) : new Date();
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
      const { account_type, event_type, post_limit, show_shop_tag, memo, paid_user_expiration_date } = this;
      await this.apiService.user.update(this.id, { account_type, event_type, post_limit, show_shop_tag, memo, paid_user_expiration_date });
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
      const { fullname, avatar, phone, account_type, event_type, email, password, username, nickname, post_limit } = this;
      console.log(fullname, avatar, phone, account_type, email, password, username, nickname)
      await this.apiService.user.add({ avatar, phone, account_type, event_type: "B", post_limit, password, username, nickname, email: username });
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
