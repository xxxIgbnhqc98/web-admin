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
  selector: 'app-add-category',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddCategoryComponent implements OnInit {
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  name: string;
  avatar: string;
  thema_id: string;
  thema_name: string;
  theme_color: string = "#f44336"
  themas: any = [];
  loadingUploadAvatar: boolean = false;
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
      this.thema_id = params.thema_id;
      const query: any = {
        fields: ["$all"],
        limit: 9999999
      }
      this.themas = await this.apiService.thema.getList({
        query
      });
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

  backToList(thema_id?: string) {
    if (thema_id) {
      this.router.navigate(['/category/category-list/', thema_id], { relativeTo: this.route });
    } else {
      this.router.navigate(['/category/category-list'], { relativeTo: this.route });
    }
  }

  setDefaultData() {
    this.titleService.setTitle('Add new thema');
    this.name = null;
    this.avatar = null;
    this.thema_id = this.thema_id
    return {
      name: this.name,
      avatar: this.avatar,
      thema_id: this.thema_id
    };
  }

  async setData() {
    try {
      const data = await this.apiService.category.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.avatar = data.avatar;
      this.name = data.name;
      this.thema_id = data.thema_id
      this.titleService.setTitle(this.name);
      console.log("@#$@#$@ ", this.thema_id)

    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  rgb2hex(orig) {
    var a, isPercent,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ? "#" +
        (rgb[1] | 1 << 8).toString(16).slice(1) +
        (rgb[2] | 1 << 8).toString(16).slice(1) +
        (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
    if (alpha !== "") {
      isPercent = alpha.indexOf("%") > -1;
      a = parseFloat(alpha);
      if (!isPercent && a >= 0 && a <= 1) {
        a = Math.round(255 * a);
      } else if (isPercent && a >= 0 && a <= 100) {
        a = Math.round(255 * a / 100)
      } else {
        a = "";
      }
    }
    if (a) {
      hex += (a | 1 << 8).toString(16).slice(1);
    }
    return hex;
  }

  async updateItem(form: NgForm) {
    try {
      let { name, theme_color } = this;
      if (theme_color.match('rgba')) {
        theme_color = this.rgb2hex(theme_color)
      }
      await this.apiService.category.update(this.id, { name, theme_color });
      this.alertSuccess();
      this.backToList(this.thema_id);
      this.submitting = false;
      form.reset();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }


  async addItem(form: NgForm) {
    try {
      // this.password = new Md5().appendStr(this.password_show).end();
      let { thema_id, name, theme_color } = this;
      if (theme_color.match('rgba')) {
        theme_color = this.rgb2hex(theme_color)
      }
      await this.apiService.category.add({ thema_id, name, theme_color });
      form.reset();
      this.alertSuccess();
      this.backToList(thema_id);
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
