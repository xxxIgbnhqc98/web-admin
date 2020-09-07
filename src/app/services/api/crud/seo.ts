import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface ISeo extends ICrud {
}

export class Seo extends CrudAPI<ISeo> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'seo');
  }
}
