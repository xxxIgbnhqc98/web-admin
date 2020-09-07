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
  selector: 'app-add-banner',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddBannerComponent implements OnInit {
  @ViewChild('multiSelect') multiSelect;

  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  title: string;
  thumbnail: string;
  loadingUploadAvatar: boolean = false;
  url: string;
  phone: string;
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
  alertUrlNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Invalid URL' : ((this.configService.lang === 'vn') ? 'URL không hợp lệ' : 'Invalid 유효하지 않은 url'),
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
    this.router.navigate(['/banner/banner-list'], { relativeTo: this.route });
  }

  setDefaultData() {
    this.titleService.setTitle('Add new banner');
    this.title = null;
    this.url = null;
    this.thumbnail = null
    this.phone = null

    return {
      title: this.title,
      thumbnail: this.thumbnail,
      url: this.url,
      phone: this.phone,
    };
  }

  async setData() {
    try {
      const data = await this.apiService.banner.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.title = data.title;
      this.url = data.url;
      this.thumbnail = data.thumbnail;
      this.phone = data.phone;
      this.titleService.setTitle(this.title);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  async updateItem(form: NgForm) {
    try {
      const { title, url, phone, thumbnail } = this;
      await this.apiService.banner.update(this.id, { title, url, phone, thumbnail });
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
      const { title, url, phone, thumbnail } = this;
      await this.apiService.banner.add({ title, url, phone, thumbnail });
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
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    console.log("coi coi ", pattern.test(this.url))
    if (form.valid && this.thumbnail && pattern.test(this.url)) {
      await this.updateItem(form);
    } else {
      if (!pattern.test(this.url)) {
        this.alertUrlNotValid();
      } else {
        this.alertFormNotValid();
      }
      this.submitting = false;

    }
  }

  async submitAdd(form: NgForm) {
    this.submitting = true;
    if (form.valid && this.thumbnail) {
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
          this.thumbnail = result.url;
          this.loadingUploadAvatar = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeAvatar() {
    this.thumbnail = null;
  }
}
