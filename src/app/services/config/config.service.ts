import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
@Injectable()
export class ConfigService {

  constructor() {
    this.config = {
      host: environment.host,
      version: environment.version,
      isLogon: '',
      token: '',
      id: '',
      avatar: '',
      fullname: '',
      type: '',
      lang: ''
    };
  }

  config: {
    host: string
    version: string,
    fullname: string,
    avatar: string,
    type: string,
    id: string,
    isLogon: string,
    token: string,
    lang: string
  };

  apiUrl(path: string = '') {
    return `${this.config.host}/api/${this.config.version}/${path}`;
  }

  get id() {
    return localStorage.getItem('id');
  }

  set id(value: string) {
    localStorage.setItem('id', value);
  }
  get username() {
    return localStorage.getItem('username');
  }

  set username(value: string) {
    localStorage.setItem('username', value);
  }
  get password() {
    return localStorage.getItem('password');
  }

  set password(value: string) {
    localStorage.setItem('password', value);
  }
  get fullname() {
    return localStorage.getItem('fullname');
  }

  set fullname(value: string) {
    localStorage.setItem('fullname', value);
  }

  get token() {
    return localStorage.getItem('token');
  }

  set token(value: string) {
    localStorage.setItem('token', value);
  }

  get avatar() {
    return localStorage.getItem('avatar');
  }

  set avatar(value: string) {
    localStorage.setItem('avatar', value);
  }

  get type() {
    return localStorage.getItem('type');
  }

  set type(value: string) {
    localStorage.setItem('type', value);
  }

  get isLogon() {
    return localStorage.getItem('isLogon');
  }

  set isLogon(value: string) {
    localStorage.setItem('isLogon', value);
  }
  get lang() {
    return localStorage.getItem('lang');
  }

  set lang(value: string) {
    localStorage.setItem('lang', value);
  }
}
