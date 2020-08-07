import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IContact extends ICrud {
}

export class Contact extends CrudAPI<IContact> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'contact');
  }
}
