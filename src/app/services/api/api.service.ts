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
import { Banner } from './crud/banner';
import { Setting } from './crud/setting';
import { SettingUserPermission } from './crud/setting_user_permission';
import { Contact } from './crud/contact';
import { Content } from './crud/content';
import { Statistic } from './crud/statistic';
import { Seo } from './crud/seo';
import { Meta } from './crud/meta';
import { Bulletin } from './crud/bulletin';
import { Comment } from './crud/comment';
import { Review } from './crud/review';
import { Recruit } from './crud/recruit';

import { History } from './crud/history';
import { Report } from './crud/report';
import { Faq } from './crud/faq';
import { FaqCategory } from './crud/faq_category';
import { Reservation } from './crud/reservation';
import { Course } from './crud/course';

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
  faq = new Faq(this);
  faq_category = new FaqCategory(this);
  link = new Link(this);
  contact = new Contact(this);
  reservation = new Reservation(this);

  category = new Category(this);
  shop = new Shop(this);
  tag = new Tag(this);
  city = new City(this);
  district = new District(this);
  ward = new Ward(this);
  event = new Event(this);
  banner = new Banner(this);
  setting = new Setting(this);
  seo = new Seo(this);
  meta = new Meta(this);
  content = new Content(this);
  settingUserPermission = new SettingUserPermission(this);
  statistic = new Statistic(this);
  bulletin = new Bulletin(this);
  recruit = new Recruit(this);
  comment = new Comment(this);
  review = new Review(this);
  pushNotification = new PushNotification(this);
  history = new History(this);
  report = new Report(this);
  course = new Course(this);

}
