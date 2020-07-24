import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IDistrict extends ICrud {
}

export class District extends CrudAPI<IDistrict> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'district');
  }
}
