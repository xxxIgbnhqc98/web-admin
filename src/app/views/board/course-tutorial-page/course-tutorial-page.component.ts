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
  selector: 'app-course-tutorial-page',
  templateUrl: 'course-tutorial-page.component.html',
  styleUrls: ['./course-tutorial-page.component.scss']
})
export class CourseTutorialPageComponent implements OnInit {
  submitting: boolean = false;
  content_title: string = null;
  id_title: string;
  content_running_time: string = null;
  id_running_time: string;
  content_description: string = null;
  id_description: string;
  content_fullday_price: string = null;
  id_fullday_price: string;
  content_fullday_discount: string = null;
  id_fullday_discount: string;
  content_day_price: string = null;
  id_day_price: string;
  content_day_discount: string = null;
  id_day_discount: string;
  content_night_price: string = null;
  id_night_price: string;
  content_night_discount: string = null;
  id_night_discount: string;
  content_unit: string = null;
  id_unit: string;
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
    this.titleService.setTitle('Course tutorial page');
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
            type: { $in: ['COURSE_DAY_DISCOUNT_TUTORIAL', 'COURSE_DAY_PRICE_TUTORIAL', 'COURSE_DESCRIPTION_TUTORIAL', 'COURSE_FULL_DAY_DISCOUNT_TUTORIAL', 'COURSE_FULL_DAY_PRICE_TUTORIAL', 'COURSE_NIGHT_DISCOUNT_TUTORIAL', 'COURSE_NIGHT_PRICE_TUTORIAL', 'COURSE_RUNNING_TIME_TUTORIAL', 'COURSE_TITLE_TUTORIAL', 'COURSE_UNIT_TUTORIAL'] }
          },
          order: [['type', 'asc']]
        }
      });
      this.id_day_discount = data[0].id;
      this.content_day_discount = data[0].content;
      this.id_day_price = data[1].id;
      this.content_day_price = data[1].content;
      this.id_description = data[2].id;
      this.content_description = data[2].content;
      this.id_fullday_discount = data[3].id;
      this.content_fullday_discount = data[3].content;
      this.id_fullday_price = data[4].id;
      this.content_fullday_price = data[4].content;
      this.id_night_discount = data[5].id;
      this.content_night_discount = data[5].content;
      this.id_night_price = data[6].id;
      this.content_night_price = data[6].content;
      this.id_running_time = data[7].id;
      this.content_running_time = data[7].content;
      this.id_title = data[8].id;
      this.content_title = data[8].content;
      this.id_unit = data[9].id;
      this.content_unit = data[9].content;
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
      if (type === 'COURSE_DESCRIPTION_TUTORIAL') {
        id = this.id_description
        content = this.content_description
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
