import { Component, OnInit, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Md5 } from 'ts-md5/dist/md5';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';
import { html } from '../../_html_de';
import { ApiService } from '../../services/api/api.service';
import axios from 'axios';

declare var swal: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: 'tool-box.component.html',
  styleUrls: ['./tool-box.component.scss']

})

export class ToolBoxComponent implements OnInit {
  submitting: boolean = false;
  description: any = html;
  stopListening: Function;
  public editorOptions: Object = {
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
    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineClass', 'inlineStyle', 'paragraphStyle', 'lineHeight', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'fontAwesome', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'getPDF', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    placeholderText: ' ',
    key: 'EA1C1C2G2H1A17vB3D2D1B1E5A4D4I1A16B11iC-13xjtH-8hoC-22yzF4jp=='
  };
  constructor(

    private configService: ConfigService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2) {
    this.stopListening =
      renderer.listen('window', 'message', this.handleMessage.bind(this));
  }
  handleMessage(event: Event) {
    const message = event as MessageEvent;

    // Only trust messages from the below origin.
    // if (message.origin !== '*') return;
    console.log(message.data)
    if (message.data.type !== "webpackWarnings") {
      this.description = message.data.html || message.data
    } else {
      this.description = html
    }
    // this.updateDe()
  }
  async ngOnInit() {

  }
  toHtml() {
    window.postMessage(this.description, '*')
    parent.postMessage(this.description, '*')

  }
  toDashboard() {
    this.router.navigate(['users']);
  }

  alertFormNotHaveValid() {
    swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000
    });
  }

  alertErrorFormServer(message) {
    swal({
      title: message,
      type: 'warning',
      timer: 2000
    });
  }
}
