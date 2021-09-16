import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IReservation extends ICrud {
}

export class Reservation extends CrudAPI<IReservation> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'reservation');
  }
}
