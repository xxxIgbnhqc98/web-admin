import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IFaq extends ICrud {
}

export class Faq extends CrudAPI<IFaq> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'Faq');
  }
}
