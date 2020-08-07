import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Md5 } from 'ts-md5/dist/md5';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';

declare var swal: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: 'user-change-password.component.html'
})
export class UserChangePasswordComponent implements OnInit {
  submitting: boolean = false;
  new_password: any;
  new_password_show: any;
  re_new_password_show: any;
  token: any;
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router) {

  }

  async ngOnInit() {
    const token = this.router.url.split('=');
    if (token) {
      this.token = token[1];
    }
  }

  async submitGetPassword(form: NgForm) {
    if (form.valid) {
      await this.getPassword(form);
    } else {
      this.alertFormNotHaveValid();
    }
  }

  async getPassword(form: NgForm) {
    try {
      this.submitting = true;
      if (this.new_password_show !== this.re_new_password_show) {
        this.submitting = false;
        this.alertErrorPassword();
        return;
      }
      this.new_password = new Md5().appendStr(this.new_password_show).end();
      const { token, new_password } = this;
      await this.authService.userGetPassword({ token: token.replace(/@hitek/g, '.'), new_password });
      form.reset();
      this.alertSuccess();
      this.submitting = false;
    } catch (error) {
      this.submitting = false;
      this.alertErrorFormServer(error.error.message);
    }
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

  alertErrorPassword() {
    swal({
      title: 'Password and confirm password do not match',
      type: 'warning',
      timer: 2000
    });
  }


  alertSuccess() {
    swal({
      title: (this.configService.lang === 'en') ? 'Successfully!' : ((this.configService.lang === 'vn') ? 'Thành công!' : '성공'),
      type: 'success',
      timer: 2000
    });
  }
}
