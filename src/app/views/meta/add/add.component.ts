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
  selector: 'app-add-meta',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddMetaComponent implements OnInit {
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  name: string;
  seo_id: string;
  content: string;
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
      this.seo_id = params.seo_id;
      
      // const query: any = {
      //   fields: ["$all"],
      //   limit: 9999999
      // }
      // this.themas = await this.apiService.thema.getList({
      //   query
      // });
      if (this.id == null) {
        if(!this.seo_id){
          this.backToSeoList();
        }
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
  backToSeoList(seo_id?: string) {
    this.router.navigate(['/seo/seo-list'], { relativeTo: this.route });
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

  backToList(seo_id?: string) {
    if (seo_id) {
      this.router.navigate(['/meta/meta-list/', seo_id], { relativeTo: this.route });
    } else {
      this.router.navigate(['/meta/meta-list'], { relativeTo: this.route });
    }
  }

  setDefaultData() {
    this.titleService.setTitle('Add new thema');
    this.name = null;
    this.content = null;
    this.seo_id = this.seo_id
    return {
      name: this.name,
      content: this.content,
      seo_id: this.seo_id
    };
  }

  async setData() {
    try {
      const data = await this.apiService.meta.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.content = data.content;
      this.name = data.name;
      this.seo_id = data.seo_id
      this.titleService.setTitle(this.name);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  async updateItem(form: NgForm) {
    try {
      const { name, content, seo_id } = this;
      await this.apiService.meta.update(this.id, { name, content });
      this.alertSuccess();
      this.backToList(this.seo_id);
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
      const { content, seo_id, name } = this;
      await this.apiService.meta.add({ content, seo_id, name });
      form.reset();
      this.alertSuccess();
      this.backToList(seo_id);
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

  // uploadAvatar(fileInput) {
  //   this.loadingUploadAvatar = true;
  //   try {
  //     const files = this.fileAvatarElementRef.nativeElement.files;
  //     const file = files[0];
  //     const result = this.apiService.fileUploader.uploadImage(file, 300)
  //       .then(result => {
  //         this.avatar = result.url;
  //         this.loadingUploadAvatar = false;
  //       });
  //   } catch (err) {
  //     console.log('Không úp được hình');
  //   }
  // }

  // removeAvatar() {
  //   this.avatar = null;
  // }
}
