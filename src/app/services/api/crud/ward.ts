import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IWard extends ICrud {
}

export class Ward extends CrudAPI<IWard> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'ward');
  }
}
