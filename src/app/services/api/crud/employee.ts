import { CrudAPI, ICrud } from '../crud';
import { ApiService } from '../api.service';

export interface IEmployee extends ICrud {
  email?: string,
  fullname?: string,
  avatar?: string,
  phone?: string,
  username?: string,
  type?: string
  status?: any;
  password?: any;
}

export class Employee extends CrudAPI<IEmployee> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'employee');
  }
}