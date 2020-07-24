import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as Console from 'console-prefix';
import { HttpRequest, HttpHeaders, HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
@Injectable()
export class AuthService {
  options: CrudOptions;
  constructor(
    public configService: ConfigService,
    public http: HttpClient
  ) {
    if (this.configService.isLogon === 'true' && this.configService.token !== '') {
      var base64Url = this.configService.token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(window.atob(base64));
      if (this.configService.id === data.payload.employee_id) {
        this.onAuthStateChange.next(true);
      } else {
        this.onAuthStateChange.next(false);
      }
    } else {
      this.onAuthStateChange.next(false);
    }
  }

  get log() { return Console('[innowayAuth]').log; }

  onAuthStateChange = new BehaviorSubject<Boolean>(undefined);
  adminToken: string;
  user: IUser;
  manuallyLogin: boolean = false;

  async exec(option: any) {
    if (!option) { throw new Error('option undefined in exec'); }
    try {
      const httpOptions = new HttpHeaders(option.headers);
      const req = new HttpRequest(option.method, option.uri, option.body,
        { headers: httpOptions, reportProgress: true, responseType: option.responseType });
      return this.http.request(req).toPromise().then(res => res);;
    } catch (resError) {
      this.log('Innoway Auth ERROR', resError.error.message);
      throw resError;
    }
  }
  async getContent(type: string, options?: CrudOptions) {
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'GET',
      uri: this.configService.config.host + '/api/' + this.configService.config.version + '/' + 'content/get_by_type' + type + '?fields=["$all"]',
      params: options.query,
      headers: _.merge({}, {
        'Content-Type': 'application/json',
      }, options.headers),
      responseType: 'json'
    };
    let resp: any;
    try {
      resp = await this.exec(setting);
    } catch (err) {
      resp = err;
      throw resp;
    }
    const res: any = resp;
    const row = res.body.results;
    return row;
  }
  async employeeLogin(data: any, options?: CrudOptions) {
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.configService.config.host + '/api/' + this.configService.config.version + '/' + 'auth/employee_login',
      params: options.query,
      headers: _.merge({}, {
        'Content-Type': 'application/json',
      }, options.headers),
      body: data,
      responseType: 'json'
    };
    let resp: any;
    try {
      resp = await this.exec(setting);
    } catch (err) {
      resp = err;
      throw resp;
    }
    const res: any = resp;
    const row = res.body.results;
    this.configService.fullname = row.object.fullname !== null ? row.object.fullname : row.object.username;
    this.configService.token = 'Bearer ' + row.token;
    this.configService.isLogon = 'true';
    this.configService.id = row.object.id;
    this.configService.avatar = row.object.avatar;
    this.onAuthStateChange.next(true);
    return row;
  }

  async userGetPassword(data: any, options?: CrudOptions) {
    console.log("@#$%%^ ", data)
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.configService.config.host + '/api/' + this.configService.config.version + '/' + 'auth/get_password',
      params: options.query,
      headers: _.merge({}, {
        'Content-Type': 'application/json',
      }, options.headers),
      body: data,
      responseType: 'json'
    };
    let resp: any;
    try {
      resp = await this.exec(setting);
    } catch (err) {
      resp = err;
      throw resp;
    }
    return resp;
  }

  async logout() {
    localStorage.removeItem('fullname');
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('isLogon');
    localStorage.removeItem('avatar');
    this.user = undefined;
    this.onAuthStateChange.next(false);
    return true;
  }

  get authenticated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.onAuthStateChange.getValue() !== undefined) {
        resolve(this.onAuthStateChange.getValue() as boolean);
      } else {
        const subscription = this.onAuthStateChange.subscribe(state => {
          if (subscription) {
            resolve(state as boolean);
            subscription.unsubscribe();
          }
        });
      }
    });
  }
}

export interface IUser {
  token: string;
  username: string;
  password: string;
  fullname?: string;
  type?: string;
  email: string;
  phone?: string;
  status?: number;
  avatar?: string;
  id?: string;
}

export interface CrudOptions {
  reload?: boolean;
  local?: boolean;
  query?: CrudQuery;
  headers?: any;
  decodeUrl?: boolean;
}

export interface CrudQuery {
  filter?: any;
  fields?: any[];
  order?: any[];
  items?: any[];
  limit?: number;
  page?: number;
  offset?: number;
  [x: string]: any;
}
