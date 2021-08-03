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
export class AddFaqCategoryComponent implements OnInit {
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  name: string;
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
    this.router.navigate(['/faq-category/faq-category-list'], { relativeTo: this.route });
  }

  setDefaultData() {
    this.titleService.setTitle('Add new thema');
    this.name = null;
    return {
      name: this.name,
    };
  }

  async setData() {
    try {
      const data = await this.apiService.faq_category.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.name = data.name;
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
      await this.apiService.faq_category.update(this.id, { name });
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
      // const { .faq_category., email, password } = this;
      await this.apiService.faq_category.add({ name: this.name });
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
}
