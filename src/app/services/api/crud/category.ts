import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface ICategory extends ICrud {
}

export class Category extends CrudAPI<ICategory> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'category');
  }
}
