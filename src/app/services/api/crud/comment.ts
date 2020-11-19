import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IComment extends ICrud {
}

export class Comment extends CrudAPI<IComment> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'comment');
  }
  async getList(options?: CrudOptions){
    options = _.merge({}, this.options, options);
    console.log("@#$%^ qr", options.query)
    const setting = {
      method: 'GET',
      uri: this.apiUrl("get_list_admin"),
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
      this.pagination = pagination.body.pagination;
      this.pagination.totalItems = results.body.results.objects.count || 0;
      this.count_random_20_shop = results.body.results.objects.count_random_20_shop
      this.hashCache[hashedQuery] = {
        pagination: this.pagination,
        items: rows
      };
      console.log("pagination ne ", this.pagination)
      this.items.next(rows);
    }
    return rows;
  }
}
