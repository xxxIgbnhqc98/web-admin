import { BaseAPI } from './base';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ApiService } from './api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';

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

export interface ICrud {
  id?: string;
  created_at?: Date;
  deleted_at?: Date;
  status?: any;
  updated_at?: Date;

  [key: string]: any;
}

export interface ICrudPagination {
  current_page?: number;
  limit?: number;
  next_page?: number;
  prev_page?: number;
  totalItems?: number;
  pageItemsCount?: number;
}

export class CrudAPI<T> extends BaseAPI {
  options: CrudOptions;
  items: BehaviorSubject<T[]>;
  pagination: ICrudPagination;
  localBrandName: string;
  count_random_20_shop: number;
  hashCache: {
    [hash: string]: {
      pagination: ICrudPagination
      items: T[]
    }
  };
  activeHashQuery: string;
  activeQuery: CrudQuery = {};

  constructor(
    public api: ApiService,
    public moduleName: string
  ) {
    super(api, moduleName);
    this.options = {
      reload: true, // Auto update items list each request, 'false' to get result only.
      local: true, // Get local data instant request server.
      query: {}
    };
    this.items = new BehaviorSubject<T[]>([]);
    this.pagination = {
      current_page: 0,
      limit: 20,
      next_page: 2,
      prev_page: 0,
      totalItems: 0
    };
    this.hashCache = {};
  }

  async getList(options?: CrudOptions): Promise<T[]> {
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
    const rows = results.body.results.objects.rows as T[];
    if (options.reload) {
      this.pagination = pagination.body.pagination;
      this.pagination.totalItems = results.body.results.objects.count || 0;
      this.count_random_20_shop = results.body.results.objects.count_random_20_shop
      this.hashCache[hashedQuery] = {
        pagination: this.pagination,
        items: rows
      };
      this.items.next(rows);
    }
    return rows;
  }
  async count(options?: CrudOptions): Promise<T[]> {
    options = _.merge({}, this.options, options);
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
    return results.body.results.objects.count;
  }

  async export(options?: CrudOptions): Promise<T> {
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'GET',
      uri: this.apiUrl(`export`),
      headers: _.merge({}, {
        'User-Agent': 'Request-Promise',
        'Authorization': this.api.configService.token
      }, options.headers),
    };
    const res: any = await this.exec(setting);
    return res;
  }

  async getItem(id: string, options?: CrudOptions): Promise<T> {
    if (!id) { throw new Error('id undefined in getItem'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'GET',
      uri: this.apiUrl(id),
      params: options.query,
      headers: _.merge({}, {
        'Authorization': this.api.configService.token
      }, options.headers),
      responseType: 'json'
    };
    const hashedQuery = hash(options.query);
    const resp = await this.exec(setting);
    const res: any = resp;
    const row = res.body.results.object as T;
    if (options.reload) {
      if (hashedQuery === this.activeHashQuery && this.hashCache[this.activeHashQuery]) {
        const items: any = this.items.getValue();
        const index = _.findIndex(items, { id: id });
        if (index > -1) {
          items[index] = row;
        } else {
          items.push(row);
        }
        this.hashCache[this.activeHashQuery].items = items;
        this.hashCache = {
          [this.activeHashQuery]: this.hashCache[this.activeHashQuery]
        };
        this.items.next(items);
      } else {
        if (!this.hashCache[hashedQuery]) {
          this.hashCache[hashedQuery] = {
            pagination: {},
            items: []
          };
        }
        const id2: any = { id: id }
        const index = _.findIndex(this.hashCache[hashedQuery].items, id2);
        if (index > -1) {
          this.hashCache[hashedQuery].items[index] = row;
        } else {
          this.hashCache[hashedQuery].items.push(row);
        }
      }
    }
    return row;
  }

  async add(data: T, options?: CrudOptions): Promise<T> {
    if (!data) { throw new Error('data undefined in add'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.apiUrl(),
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
    const row = res.body.results.object as T;
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

  async update(id: string, data: T, options?: CrudOptions): Promise<T> {
    if (!id) { throw new Error('id undefined in edit'); }
    if (!data) { throw new Error('data undefined in edit'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'PUT',
      uri: this.apiUrl(id),
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
    const row = res.body.results.object as T;
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

  async delete(id: string, options?: CrudOptions) {
    if (!id) { throw new Error('id undefined in delete'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'DELETE',
      uri: this.apiUrl(id),
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

  async deleteAll(ids: string[], options?: CrudOptions) {
    if (!ids) { throw new Error('ids undefined in deleteAll'); }
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'DELETE',
      uri: this.apiUrl(),
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

  protected _paserQuery(query: CrudQuery = {}) {
    const parsedQuery: any = _.merge({}, query);

    if (query.filter) {
      parsedQuery.filter = JSON.stringify(query.filter);
    }
    if (query.order) {
      parsedQuery.order = JSON.stringify(query.order);
    }
    if (query.scopes) {
      parsedQuery.scopes = JSON.stringify(query.scopes);
    }
    if (query.fields) {
      parsedQuery.fields = JSON.stringify(query.fields);
    }
    if (query.items) {
      parsedQuery.items = JSON.stringify(query.items);
    }
    return parsedQuery;
  }
}
