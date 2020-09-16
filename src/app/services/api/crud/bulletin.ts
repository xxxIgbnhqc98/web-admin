import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IBulletin extends ICrud {
}

export class Bulletin extends CrudAPI<IBulletin> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'post');
  }
}
