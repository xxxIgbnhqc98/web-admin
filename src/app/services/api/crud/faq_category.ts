import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IFaqCategory extends ICrud {
}

export class FaqCategory extends CrudAPI<IFaqCategory> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'faq_category');
  }
}
