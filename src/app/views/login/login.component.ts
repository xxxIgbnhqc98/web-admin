import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Md5 } from 'ts-md5/dist/md5';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';

declare var swal: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit{
  submitting: boolean = false;
  username: string;
  password: any;
  password_show: any;
  constructor(private configService: ConfigService,
    private authService: AuthService,
    private router: Router) {

  }

  async ngOnInit(){

  }

  async submitLogin(form: NgForm){
    if(form.valid){
      await this.login(form);
    } else {
      this.alertFormNotHaveValid();
    }
  }

  async login(form: NgForm){
    try {
      this.submitting = true;
      this.password = new Md5().appendStr(this.password_show).end();
      const { username, password } = this;
      await this.authService.employeeLogin({ username, password});
      this.toDashboard();
    } catch (error) {
      this.submitting = false;
      this.alertErrorFormServer(error.error.message);
    }
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

  alertErrorFormServer(message){
    swal({
      title: message,
      type: 'warning',
      timer: 2000
    });
  }
}
