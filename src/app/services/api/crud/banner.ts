import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IBanner extends ICrud {
}

export class Banner extends CrudAPI<IBanner> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'banner');
  }
}
