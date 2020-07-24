import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface ILink extends ICrud {
}

export class Link extends CrudAPI<ILink> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'link');
  }
}
