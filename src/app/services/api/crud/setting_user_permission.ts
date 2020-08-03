import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface ISettingUserPermission extends ICrud {
}

export class SettingUserPermission extends CrudAPI<ISettingUserPermission> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'setting_user_permission');
  }
}
