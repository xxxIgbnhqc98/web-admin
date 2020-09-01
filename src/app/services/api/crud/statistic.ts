import { CrudAPI, ICrud, CrudOptions } from '../crud';
import { ApiService } from '../api.service';
import * as _ from 'lodash';
import * as hash from 'object-hash';
export interface IStatistic extends ICrud {
}

export class Statistic extends CrudAPI<IStatistic> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'statistic');
  }
  async getStatisticTraffic(data: any, options?: CrudOptions): Promise<IStatistic> {
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.api.configService.apiUrl('statistic/traffic'),
      params: options.query,
      headers: _.merge({}, { // headers
        'Content-Type': 'application/json',
        'Authorization': this.api.configService.token
      },
        options.headers),
      body: data,
      json: true
    };
    const hashedQuery = hash(options.query);
    this.activeHashQuery = hashedQuery;
    this.activeQuery = options.query;
    const resp = await this.exec(setting);
    const res: any = resp;
    return res.body.results.object.statistic as IStatistic;
  }
  async getStatisticPeriod(data: any, options?: CrudOptions): Promise<IStatistic> {
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.api.configService.apiUrl('statistic/period'),
      params: options.query,
      headers: _.merge({}, { // headers
        'Content-Type': 'application/json',
        'Authorization': this.api.configService.token
      },
        options.headers),
      body: data,
      json: true
    };
    const hashedQuery = hash(options.query);
    this.activeHashQuery = hashedQuery;
    this.activeQuery = options.query;
    const resp = await this.exec(setting);
    const res: any = resp;
    return res.body.results.object.statistic as IStatistic;
  }
  async getStatisticVisitorViewPage(data: any, options?: CrudOptions): Promise<IStatistic> {
    options = _.merge({}, this.options, options);
    const setting = {
      method: 'POST',
      uri: this.api.configService.apiUrl('statistic/visitor_pageview'),
      params: options.query,
      headers: _.merge({}, { // headers
        'Content-Type': 'application/json',
        'Authorization': this.api.configService.token
      },
        options.headers),
      body: data,
      json: true
    };
    const hashedQuery = hash(options.query);
    this.activeHashQuery = hashedQuery;
    this.activeQuery = options.query;
    const resp = await this.exec(setting);
    const res: any = resp;
    return res.body.results.object as IStatistic;
  }
}
