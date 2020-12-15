import { Component, OnInit, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Md5 } from 'ts-md5/dist/md5';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';
import { html } from '../../_html_de';

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
    charCounterCount: true,
    imageUploadParam: 'image_param',
    imageUploadURL: 'assets/upload_image',
    imageUploadParams: { id: 'my_editor' },
    imageUploadMethod: 'POST',
    imageMaxSize: 5 * 1024 * 1024,
    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
    events: {
      'froalaEditor.initialized': function () {
        console.log('initialized');
      },
      'froalaEditor.image.beforeUpload': function (e, editor, images) {
        if (images.length) {
          // Create a File Reader.
          const reader = new FileReader();
          // Set the reader to insert images when they are loaded.
          reader.onload = (ev) => {
            const result = ev.target['result'];
            editor.image.insert(result, null, null, editor.image.get());
            console.log(ev, editor.image, ev.target['result'])
          };
          // Read image as base64.
          reader.readAsDataURL(images[0]);
        }
        // Stop default upload chain.
        return false;
      }

    },
    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineClass', 'inlineStyle', 'paragraphStyle', 'lineHeight', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'fontAwesome', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'getPDF', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    placeholderText: ' ',
    key: 'EA1C1C2G2H1A17vB3D2D1B1E5A4D4I1A16B11iC-13xjtH-8hoC-22yzF4jp=='
  };
  constructor(

    private configService: ConfigService,
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
