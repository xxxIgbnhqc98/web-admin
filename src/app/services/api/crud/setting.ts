import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface ISetting extends ICrud {
}

export class Setting extends CrudAPI<ISetting> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'setting');
  }
}
