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

  async deleteShop(id: string, options?: CrudOptions) {
    if (!id) { throw new Error('id undefined in delete'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'DELETE',
      uri: this.apiUrl("hard_delete/" + id),
      params: options.query,
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      responseType: 'json'
    };
    const res = await this.exec(setting);

    if (options.reload) {
      const items = this.items.getValue();
      const removed = _.remove(items, function (item: any) {
        return item.id === id;
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
  async cloneShop(id, options?: CrudOptions) {
    if (!id) { throw new Error('data undefined in add'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.apiUrl("clone_shop/" + id),
      params: options.query,
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      body: {},
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
  async removeReTime(ids: string[], options?: CrudOptions) {
    if (!ids) { throw new Error('id undefined in edit'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'PUT',
      uri: this.apiUrl(`force_expired_multiple`),
      params: _.merge({}, {
        items: ids
      }, options.query),
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      body: {},
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
  async editReTime(id: string, data, options?: CrudOptions) {
    if (!id) { throw new Error('id undefined in edit'); }
    if (!data) { throw new Error('data undefined in edit'); }
    const ids = []
    ids.push(id)
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'PUT',
      uri: this.apiUrl(`update_expiration_date_multiple`),
      params: _.merge({}, {
        items: ids
      }, options.query),
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
  async rejectAll(ids: string[], options?: CrudOptions) {
    if (!ids) { throw new Error('ids undefined in rejectAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.apiUrl('reject'),
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
  async approveAll(ids: string[], data, options?: CrudOptions) {
    if (!ids) { throw new Error('ids undefined in rejectAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.apiUrl('approve'),
      params: _.merge({}, {
        items: ids
      }, options.query),
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      body: data,
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
  async addDateAll(data: any, ids: string[], options?: CrudOptions) {
    console.log(ids)
    if (!ids) { throw new Error('ids undefined in rejectAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'PUT',
      uri: this.apiUrl(`update_expiration_date_multiple`),
      params: _.merge({}, {
        items: ids
      }, options.query),
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      body: data,
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
  async subDateAll(data: any, ids: string[], options?: CrudOptions) {
    console.log(ids)
    if (!ids) { throw new Error('ids undefined in rejectAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'PUT',
      uri: this.apiUrl(`force_expired_multiple`),
      params: _.merge({}, {
        items: ids
      }, options.query),
      headers: _.merge({}, {
        'content-type': 'application/json',
        'Authorization': this.api.configService.token
      }, options.headers),
      body: data,
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
  async setReShop(state, ids: string[], options?: CrudOptions) {
    if (!ids) { throw new Error('ids undefined in rejectAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.apiUrl('/set_recommen_shop'),
      params: _.merge({}, {
        items: ids
      }, options.query),
      body: {
        is_random_20_shop: state
      },
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
}
