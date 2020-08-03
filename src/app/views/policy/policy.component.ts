import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Md5 } from 'ts-md5/dist/md5';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';
import { html } from '../../_html_de';

declare var swal: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: 'policy.component.html'
})
export class PolicyComponent implements OnInit {
  submitting: boolean = false;
  description: any = html;
  html: any;
  constructor(private configService: ConfigService,
    private authService: AuthService,
    private router: Router) {

  }

  async ngOnInit() {

  }
  toHtml() {
    this.html = this.description
    window.postMessage(this.html, '*')
  }
  updateDe() {
    this.description = this.html
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
