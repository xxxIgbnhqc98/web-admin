import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IUser extends ICrud {
}

export class User extends CrudAPI<IUser> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'user');
  }
}
