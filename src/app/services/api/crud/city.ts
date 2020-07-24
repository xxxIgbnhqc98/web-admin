import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface ICity extends ICrud {
}

export class City extends CrudAPI<ICity> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'city');
  }
}
