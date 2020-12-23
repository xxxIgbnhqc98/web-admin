import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IRecruit extends ICrud {
}

export class Recruit extends CrudAPI<Recruit> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'recruit');
  }
}
