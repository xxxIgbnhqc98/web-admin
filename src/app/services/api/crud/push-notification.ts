import { CrudAPI, ICrud } from '../crud';
import { ApiService } from '../api.service';
export interface IPushNotification extends ICrud {
  id?: string,
  title?: string,
  message_title?: string,
  message_content?: string,
  sending_unix_timestamp?: number,
  user_id?: string,
  class?: string,
  age_from?: number,
  age_to?: number,
  frequency?: string,
  type?: string,
  account_type?: string,
  last_number_of_user_to_send?: number,
  last_number_of_user_actually_be_sent?: number,
  last_number_of_user_actually_be_sent_successfully?: number,
}
export class PushNotification extends CrudAPI<IPushNotification> {
  constructor(
    public api: ApiService
  ) {
    super(api, 'push_notification');
  }

  async sendFCM(id: string, type) {
    if (!id) { throw new Error('id undefined in sendFCM api'); }
    const setting = {
      method: 'POST',
      uri: this.apiUrl(type === 'USER' ? `send_fcm_to_user/${id}` : `send_fcm_to_group/${id}`),
      params: {},
      headers: {
        'Content-type': 'application/json',
        'Authorization': this.api.configService.token
      },
      responseType: 'json'
    };
    const res = await this.exec(setting);
    return true;
  }
}
