import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IHistory extends ICrud {
}

export class History extends CrudAPI<IHistory> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'history');
  }
}
