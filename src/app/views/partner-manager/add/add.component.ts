import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { Md5 } from 'ts-md5/dist/md5';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../../services/config/config.service';
import { ShareDataService } from '../../../services/share-data/share-data-service';
declare var $: any;
declare let swal: any;

@Component({
  selector: 'app-add-partner-manager',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddPartnerManagerComponent implements OnInit {
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  email: string;
  fullname: string;
  phone: string;
  type: string;
  password: any;
  password_show: string;
  avatar: string;
  username: string;
  loadingUploadAvatar: boolean = false;
  editPass: boolean = false;

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

  backToList() {
    this.router.navigate(['/partner-manager/list'], { relativeTo: this.route });
  }
  changeStateEditPass() {
    this.editPass = true
  }

  setDefaultData() {
    this.titleService.setTitle('Add new partner manager');
    this.email = null;
    this.fullname = null;
    this.phone = null;
    this.avatar = null;
    this.password = null;
    this.type = null;
    this.username = null;
    this.password_show = null;
    return {
      email: this.email,
      fullname: this.fullname,
      phone: this.phone,
      type: this.type,
      password: this.password,
      avatar: this.avatar,
      username: this.username,
      password_show: this.password_show
    };
  }

  async setData() {
    try {
      const data = await this.apiService.employee.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.email = data.email;
      this.type = data.type;
      this.avatar = data.avatar;
      this.fullname = data.fullname;
      this.titleService.setTitle(this.fullname);
      this.phone = data.phone;
      this.username = data.username;
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  async updateItem(form: NgForm) {
    try {
      if (this.configService.id === this.id && this.configService.avatar !== this.avatar) {
        this.configService.avatar = this.avatar;
        this.shareDataService.setAvatarForEmployee(this.avatar);
      }
      if (this.password_show && this.editPass === true) {
        this.password = new Md5().appendStr(this.password_show).end();
        const { fullname, avatar, phone, type, email, password } = this;
        await this.apiService.employee.update(this.id, { fullname, avatar, phone, type, password, email });
      } else {
        const { fullname, avatar, phone, type, email } = this;
        await this.apiService.employee.update(this.id, { fullname, avatar, phone, type, email });
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
      const { fullname, avatar, phone, type, email, password, username } = this;
      await this.apiService.employee.add({ fullname, avatar, phone, type, email, password, username });
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
