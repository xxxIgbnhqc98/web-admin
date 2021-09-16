import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { ConfigService } from '../../../services/config/config.service';
declare var swal: any;
import axios from 'axios';
import { environment } from '../../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-shop-page-tutorial',
  templateUrl: 'shop-page-tutorial.component.html',
  styleUrls: ['./shop-page-tutorial.component.scss']
})
export class ShopPageTutorialComponent implements OnInit {
  submitting: boolean = false;
  content_upload_image: string = null;
  id_upload_image: string;
  content_description: string = null;
  id_description: string;
  content_sns_link: string = null;
  id_sns_link: string;
  content_reservation: string = null;
  id_reservation: string;
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
          }).then((res: any) => {
            editor.image.insert(res.data.results.object.url, null, null, editor.image.get());
          }).catch(err => {
            console.log(err);
          });
        }
        return false;
      }

    },
    placeholderText: ' ',
    // key: 'EA1C1C2G2H1A17vB3D2D1B1E5A4D4I1A16B11iC-13xjtH-8hoC-22yzF4jp==' //key for kormassage.kr
    key: environment.froalakey //key for busandal31.net
  };
  constructor(
    public ref: ChangeDetectorRef,
    public apiService: ApiService,
    public router: Router,
    public route: ActivatedRoute,
    public titleService: Title,
    private configService: ConfigService,
    private spinner: NgxSpinnerService
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Shop tutorial page');
    this.spinner.show();
    await this.getContent();
    this.spinner.hide();
  }

  async getContent() {
    try {
      const data: any = await this.apiService.content.getList({
        query: {
          fields: ['$all'],
          filter: {
            type: { $in: ['SHOP_DESCRIPTION_TUTORIAL', 'SHOP_RESERVATION_TIME_TUTORIAL', 'SHOP_SNS_LINK_TUTORIAL', 'SHOP_UPLOAD_IMAGE_TUTORIAL'] }
          },
          order: [['type', 'asc']]
        }
      });
      this.id_description = data[0].id;
      this.content_description = data[0].content;
      this.id_reservation = data[1].id;
      this.content_reservation = data[1].content;
      this.id_sns_link = data[2].id;
      this.content_sns_link = data[2].content;
      this.id_upload_image = data[3].id;
      this.content_upload_image = data[3].content;
    } catch (error) {
      this.alertItemNotFound();
    }
  }

  alertItemNotFound() {
    swal({
      title: 'No information found',
      type: 'warning',
      timer: 2000
    });
  }

  async submitEdit(form: NgForm, type) {
    if (form.valid) {
      await this.edit(form, type);
    } else {
      this.alertFormNotValid();
    }
  }

  async edit(form, type) {
    try {
      this.submitting = true;
      let id, content;
      if (type === 'SHOP_UPLOAD_IMAGE_TUTORIAL') {
        id = this.id_upload_image
        content = this.content_upload_image
      } else if (type === 'SHOP_DESCRIPTION_TUTORIAL') {
        id = this.id_description
        content = this.content_description
      } else if (type === 'SHOP_SNS_LINK_TUTORIAL') {
        id = this.id_sns_link
        content = this.content_sns_link
      } else if (type === 'SHOP_RESERVATION_TIME_TUTORIAL') {
        id = this.id_reservation
        content = this.content_reservation
      }
      if (id && console) {
        await this.apiService.content.update(id, { id, content });
      }
      this.alertSuccess();
      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }

  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
  }

  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Successfully!' : ((this.configService.lang === 'vn') ? 'Thành công!' : '성공'),
      type: 'success',
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
}
