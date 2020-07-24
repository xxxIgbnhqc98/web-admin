import { CrudAPI, ICrud, CrudOptions } from '../crud';
import * as _ from 'lodash';
import { ApiService } from '../api.service';
export interface IFileUploader extends ICrud {
  file?: File;
}

export class ReponseObject {
  constructor(public code: number, public results: string) { }
}

export class FileUploader extends CrudAPI<IFileUploader> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'file-uploader');
  }

  async uploadImage(file: File, size?: number, options?: CrudOptions) {
    options = _.merge({}, this.options, options);
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    let url
    if (size) {
      url = `image/upload/${size}`
    } else {
      url = 'image/upload'
    }
    const setting = {
      method: 'POST',
      uri: this.api.configService.apiUrl(url),
      params: options.query,
      headers: _.merge({}, {
        'Authorization': this.api.configService.token
      }, options.headers),
      body: formData,
      responseType: 'json'
    };
    const res: any = await this.exec(setting);
    let result
    if (res.body.results) {
      result = res.body.results.object;
    } else {
      result = res.body
    }
    console.log("@@@ chay vao ", result)
    return result;
  }

  async uploadVideo(video: File, options?: CrudOptions) {
    options = _.merge({}, this.options, options);
    const formData: FormData = new FormData();
    formData.append('video', video, video.name);
    const setting = {
      method: 'POST',
      uri: this.api.configService.apiUrl('video/upload'),
      params: options.query,
      headers: _.merge({}, {
        'Authorization': this.api.configService.token
      }, options.headers),
      body: formData,
      responseType: 'json'
    };
    const res: any = await this.exec(setting);
    const result = res.body.results.object;
    return result;
  }
}
