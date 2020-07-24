import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { AuthService } from '../auth/auth.service';
import { Employee } from './crud/employee';
import { FileUploader } from './crud/file-uploader';
import { User } from './crud/user';
import { PushNotification } from './crud/push-notification';
import { Thema } from './crud/thema';
import { Category } from './crud/category';
import { Shop } from './crud/shop';
import { Tag } from './crud/tag';
import { City } from './crud/city';
import { District } from './crud/district';
import { Ward } from './crud/ward';
import { Event } from './crud/event';
import { Link } from './crud/link';

@Injectable()
export class ApiService {

  constructor(
    public http: HttpClient,
    public configService: ConfigService,
    public authService: AuthService,
  ) {

  }

  employee = new Employee(this);
  fileUploader = new FileUploader(this);
  user = new User(this);
  thema = new Thema(this);
  link = new Link(this);
  category = new Category(this);
  shop = new Shop(this);
  tag = new Tag(this);
  city = new City(this);
  district = new District(this);
  ward = new Ward(this);
  event = new Event(this);



  pushNotification = new PushNotification(this);
}
