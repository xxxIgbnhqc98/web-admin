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
  constructor(private configService: ConfigService,
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
      this.description = message.data.html ||  message.data
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
