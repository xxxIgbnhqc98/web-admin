import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { ConfigService } from '../../../services/config/config.service';
declare var swal: any;
import axios from 'axios';

@Component({
  selector: 'app-event-page',
  templateUrl: 'event-page.component.html',
  styleUrls: ['./event-page.component.scss']
})
export class EventPageComponent implements OnInit {
  submitting: boolean = false;
  content_a: string = null;
  id_a: string;
  content_b: string = null;
  id_b: string;
  content_c: string = null;
  id_c: string;
  content_repeat: string = null;
  id_repeat: string;
  content_view: string = null;
  id_view: string;
  public editorOptions: Object = {
    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineClass', 'inlineStyle', 'paragraphStyle', 'lineHeight', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'fontAwesome', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'getPDF', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    events: {
      'froalaEditor.image.beforeUpload': function (e, editor, images) {
        if (images.length) {
          const data = new FormData();
          data.append('image', images[0]);
          axios.post('https://server.kormassage.kr:9877/api/v1/image/upload/600', data, {
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
    key: 'EA1C1C2G2H1A17vB3D2D1B1E5A4D4I1A16B11iC-13xjtH-8hoC-22yzF4jp=='
  };
  constructor(
    public ref: ChangeDetectorRef,
    public apiService: ApiService,
    public router: Router,
    public route: ActivatedRoute,
    public titleService: Title,
    private configService: ConfigService,
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Event page');
    this.getContent();
  }

  async getContent() {
    try {
      const data: any = await this.apiService.content.getList({
        query: {
          fields: ['$all'],
          filter: {
            type: { $in: ['EVENT_PROFILE_TYPE_A', 'EVENT_PROFILE_TYPE_B', 'EVENT_PROFILE_TYPE_C', 'repeat-application', 'view-winners'] }
          },
          order: [['type', 'asc']]
        }
      });
      this.id_a = data[0].id;
      this.content_a = data[0].content;
      this.id_b = data[1].id;
      this.content_b = data[1].content;
      this.id_c = data[2].id;
      this.content_c = data[2].content;
      this.id_repeat = data[3].id;
      this.content_repeat = data[3].content;
      this.id_view = data[4].id;
      this.content_view = data[4].content;
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
      if (type === 'A') {
        id = this.id_a
        content = this.content_a
      } else if (type === 'B') {
        id = this.id_b
        content = this.content_b
      } else if (type === 'C') {
        id = this.id_c
        content = this.content_c
      } else if (type === 'REPEAT') {
        id = this.id_repeat
        content = this.content_repeat
      } else if (type === 'VIEW') {
        id = this.id_view
        content = this.content_view
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
