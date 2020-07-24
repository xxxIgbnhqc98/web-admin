import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IEvent extends ICrud {
}

export class Event extends CrudAPI<IEvent> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'event');
  }
}
