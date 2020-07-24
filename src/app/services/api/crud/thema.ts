import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IThema extends ICrud {
}

export class Thema extends CrudAPI<IThema> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'thema');
  }
}
