import { ApiService } from './api.service';
import * as Console from 'console-prefix';
import { HttpRequest, HttpHeaders, HttpParams, HttpUrlEncodingCodec } from '@angular/common/http';

export class BaseAPI {
    params: any;
    body: any = null;
    constructor(
        public api: ApiService,
        public moduleName: string
    ) {
    }

    get log() {
        return Console(`[API ${this.moduleName}]`).log;
    }

    apiUrl(path: string = '') {
        return this.api.configService.apiUrl(`${this.moduleName}/${path}`);
    }

    // Call API
    protected async exec(option) {
        if (!option) { throw new Error('option undefined in exec'); }
        try {
            const httpOptions = new HttpHeaders(option.headers);
            if (option.body) {
                this.body = option.body;
            }
            if (option.params) {
                this.params = new HttpParams();
                //this.params = new HttpParams();
                if (option.params.fields) {
                    const fields = JSON.stringify(option.params.fields);
                    this.params = this.params.append('fields', fields);
                }
                if (option.params.filter) {
                    const filter = JSON.stringify(option.params.filter);
                    this.params = this.params.append('filter', filter);
                }
                if (option.params.limit) {
                    const limit = JSON.stringify(option.params.limit);
                    this.params = this.params.append('limit', limit);
                }
                if (option.params.offset) {
                    const offset = JSON.stringify(option.params.offset);
                    this.params = this.params.append('offset', offset);
                }
                if (option.params.page) {
                    const page = JSON.stringify(option.params.page);
                    this.params = this.params.append('page', page);
                }
                if (option.params.order) {
                    const order = JSON.stringify(option.params.order);
                    this.params = this.params.append('order', order);
                }
                if (option.params.items) {
                    const items = JSON.stringify(option.params.items);
                    this.params = this.params.append('items', items);
                }
                if (option.decode) {
                    this.params = new HttpUrlEncodingCodec().decodeValue(this.params);
                }
            }
            const req = new HttpRequest(option.method, option.uri, this.body,
                { headers: httpOptions, reportProgress: true, params: this.params, responseType: option.responseType });
            return this.api.http.request(req).toPromise().then(res => res);
        } catch (resError) {
            this.log('API ERROR', resError);
            throw resError;
        }
    }
}
