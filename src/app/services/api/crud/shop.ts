import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IShop extends ICrud {
}

export class Shop extends CrudAPI<IShop> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'shop');
  }
  async add(data, options?: CrudOptions) {
    if (!data) { throw new Error('data undefined in add'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.apiUrl('create_shop'),
      params: options.query,
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      body: data,
      responseType: 'json'
    };
    const resp = await this.exec(setting);
    const res: any = resp;
    const row = res.body.results.object;
    if (options.reload) {
      const items = this.items.getValue();
      if (items.length < this.pagination.limit) {
        this.items.next(items);
        if (this.activeHashQuery && this.hashCache[this.activeHashQuery]) {
          this.hashCache[this.activeHashQuery].items = items;
        }
        items.push(row);

      }
      if (this.activeHashQuery) {
        this.hashCache = {
          [this.activeHashQuery]: this.hashCache[this.activeHashQuery]
        };
      }
    }
    return row;
  }
  async editReTime(id: string, data, options?: CrudOptions) {
    if (!id) { throw new Error('id undefined in edit'); }
    if (!data) { throw new Error('data undefined in edit'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'PUT',
      uri: this.apiUrl("update_expiration_date/" + id),
      params: options.query,
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      body: data,
      responseType: 'json'
    };
    const resp = await this.exec(setting);
    const res: any = resp;
    const row = res.body.results.object;
    if (options.reload) {
      const items: any = this.items.getValue();
      const index = _.findIndex(items, { id: id });
      if (index > -1) {
        items[index] = row;
        if (this.activeHashQuery && this.hashCache[this.activeHashQuery]) {
          this.hashCache[this.activeHashQuery].items = items;
        }
        this.items.next(items);
      }
      if (this.activeHashQuery) {
        this.hashCache = {
          [this.activeHashQuery]: this.hashCache[this.activeHashQuery]
        };
      }
    }
    return row;
  }
}
