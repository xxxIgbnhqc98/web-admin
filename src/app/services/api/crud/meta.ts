import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IMeta extends ICrud {
}

export class Meta extends CrudAPI<IMeta> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'meta');
  }
}
