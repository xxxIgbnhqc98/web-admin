import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { Md5 } from 'ts-md5/dist/md5';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../../services/config/config.service';
import { ShareDataService } from '../../../services/share-data/share-data-service';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import axios from 'axios';
import { environment } from '../../../../environments/environment';
declare var $: any;
declare let swal: any;

@Component({
  selector: 'app-add-thema',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddFaqComponent implements OnInit {
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  name: string;
  content: string;
  loadingUploadAvatar: boolean = false;
  faq_category_id: string;
  public editorOptions: Object = {
    useClasses: false,

    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineClass', 'inlineStyle', 'paragraphStyle', 'lineHeight', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'fontAwesome', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'getPDF', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    events: {
      'froalaEditor.image.beforeUpload': function (e, editor, images) {
        if (images.length) {
          const data = new FormData();
          data.append('image', images[0]);
          axios.post(`${environment.host}/api/v1/image/upload/600`, data, {
            headers: {
            }
          }).then(async (res: any) => {
            if (res.data.results.object.url) {
              await editor.image.insert(res.data.results.object.url, null, null, editor.image.get());
            } else {
              this.alertErrorUploadImageFroala();
              editor.image.insert('https://admin.kormassage.kr/assets/img/logo.png', null, null, editor.image.get());
            }
          }).catch(err => {
            this.alertErrorUploadImageFroala();
            editor.image.insert('https://admin.kormassage.kr/assets/img/logo.png', null, null, editor.image.get());

          });
        }
        return false;
      }

    },
    placeholderText: ' ',
    // key: 'EA1C1C2G2H1A17vB3D2D1B1E5A4D4I1A16B11iC-13xjtH-8hoC-22yzF4jp==' //key for kormassage.kr
    key: environment.froalakey //key for busandal31.net
  };
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
      if (!params.faq_category_id) {
        this.backToList()
      }
      this.faq_category_id = params.faq_category_id
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
    if (this.faq_category_id) {
      this.router.navigate(['/faq/faq-list/', this.faq_category_id], { relativeTo: this.route });
    } else {
      this.router.navigate(['/faq/faq-list'], { relativeTo: this.route });
    }
  }
  // backToListCategory() {

  //   this.router.navigate(['/faq-category/faq-category-list'], { relativeTo: this.route });
  // }
  setDefaultData() {
    this.titleService.setTitle('Add new thema');
    this.name = null;
    this.content = null
    this.faq_category_id = this.faq_category_id
    return {
      name: this.name,
      content: this.content
    };
  }

  async setData() {
    try {
      const data = await this.apiService.faq.getItem(this.id, {
        query: { fields: ['$all'] }
      });
      this.name = data.name;
      this.content = data.content;
      this.faq_category_id = data.faq_category_id
      this.titleService.setTitle(this.name);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }
  }

  async updateItem(form: NgForm) {
    try {
      const { name, content } = this;
      await this.apiService.faq.update(this.id, { name, content });
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
      // const { .faq., email, password } = this;
      await this.apiService.faq.add({ name: this.name, faq_category_id: this.faq_category_id, content: this.content });
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
