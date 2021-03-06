import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface ITag extends ICrud {
}

export class Tag extends CrudAPI<ITag> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'tag');
  }
}
