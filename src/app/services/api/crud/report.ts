import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IReport extends ICrud {
}

export class Report extends CrudAPI<Report> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'report');
  }
  async countToday(options?: CrudOptions){
    options = _.merge({}, this.options, options);
    console.log("@#$%^ qr", options.query)
    const setting = {
      method: 'GET',
      uri: this.apiUrl(),
      params: options.query,
      headers: _.merge({}, {
        'Authorization': this.api.configService.token
      }, options.headers),
      responseType: 'json',
      decode: options.decodeUrl
    };
    const hashedQuery = hash(options.query);
    this.activeHashQuery = hashedQuery;
    this.activeQuery = options.query;
    const res = await this.exec(setting);
    const results: any = res;
    const pagination: any = res;
    const rows = results.body.results.objects.rows;
    if (options.reload) {

      // this.pagination = pagination.body.pagination;
      // this.pagination.totalItems = results.body.results.objects.count || 0;
      // this.hashCache[hashedQuery] = {
      //   pagination: this.pagination,
      //   items: rows
      // };
      // console.log("pagination ne ", this.pagination)
      // this.items.next(rows);
    }
    return results.body.results.objects.count || 0;
  }

  async restoreAll(ids: string[], options?: CrudOptions) {
    if (!ids) { throw new Error('ids undefined in rejectAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'PUT',
      uri: this.apiUrl('restore_multiples_report_subject'),
      params: _.merge({}, {
        items: ids
      }, options.query),
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      responseType: 'json'
    };
    const res: any = await this.exec(setting);
    if (options.reload) {
      const items = this.items.getValue();
      const removed = _.remove(items, function (item: any) {
        return _.indexOf(ids, item.id) !== -1;
      });
      if (removed.length > 0) {
        if (this.activeHashQuery && this.hashCache[this.activeHashQuery]) {
          this.hashCache[this.activeHashQuery].items = items;
        }
        this.items.next(items);
      } else {
        await this.getList({ local: false, query: this.activeQuery });
      }
      if (this.activeHashQuery) {
        this.hashCache = {
          [this.activeHashQuery]: this.hashCache[this.activeHashQuery]
        };
      }
    }
    return true;
  }
  async confirmAll(ids: string[], options?: CrudOptions) {
    if (!ids) { throw new Error('ids undefined in rejectAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'DELETE',
      uri: this.apiUrl('delete_multiples_report_subject'),
      params: _.merge({}, {
        items: ids
      }, options.query),
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      // body: data,
      responseType: 'json'
    };
    const res: any = await this.exec(setting);
    if (options.reload) {
      const items = this.items.getValue();
      const removed = _.remove(items, function (item: any) {
        return _.indexOf(ids, item.id) !== -1;
      });
      if (removed.length > 0) {
        if (this.activeHashQuery && this.hashCache[this.activeHashQuery]) {
          this.hashCache[this.activeHashQuery].items = items;
        }
        this.items.next(items);
      } else {
        await this.getList({ local: false, query: this.activeQuery });
      }
      if (this.activeHashQuery) {
        this.hashCache = {
          [this.activeHashQuery]: this.hashCache[this.activeHashQuery]
        };
      }
    }
    return true;
  }
}
