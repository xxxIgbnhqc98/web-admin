import { Component, OnInit } from '@angular/core';
// import { navItems } from './../../_nav';
import { ConfigService } from '../../services/config/config.service';
import { AuthService } from '../../services/auth/auth.service';
import { ApiService } from '../../services/api/api.service';
import { ShareDataService } from '../../services/share-data/share-data-service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import jwt_decode from 'jwt-decode';
// import { moment } from 'ngx-bootstrap/chronos/test/chain';
import * as moment from "moment";

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-laypout.component.scss']
})
export class DefaultLayoutComponent implements OnInit {
  // public navItems: any = navItems;
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement = document.body;
  fullname: string;
  avatar: string;
  from_date: Date;
  yesterday: Date = new Date();
  to_date: Date = new Date();
  uniqueVisitor: any = 0;
  uniqueFemale: any = 0;
  uniqueMale: any = 0;
  newMember: any = 0;
  newMember_male: any = 0;
  newMember_female: any = 0;
  firstPayment: any = 0;
  number_firstPayment: any = 0;
  rePayment: any = 0;
  number_rePayment: any = 0;
  listNav: any
  constructor(private configService: ConfigService,
    private authService: AuthService,
    public apiService: ApiService,
    private translate: TranslateService,
    public auth: AuthService,
    public shareDataService: ShareDataService) {
    translate.addLangs(['en', 'kr', 'vn']);
    if (!this.configService.lang) {
      translate.setDefaultLang('en');
      this.configService.lang = 'en';
    } else {
      translate.setDefaultLang(this.configService.lang);
    }
    const browserLang = this.configService.lang;
    translate.use(browserLang.match(/en|kr|vn/) ? browserLang : 'en');
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.listNav = event.translations.nav.nav_items
    });
    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = document.body.classList.contains('sidebar-minimized');
    });

    this.changes.observe(<Element>this.element, {
      attributes: true
    });
  }
  async ngOnInit() {
    this.fullname = this.configService.fullname;

    try {
      const data = await this.apiService.employee.getItem(this.configService.id, {
        query: { fields: ['$all'] }
      });
      try {
        const decodeToken = await jwt_decode(this.configService.token.slice(7, this.configService.token.length));
        if ((new Date(decodeToken.exp)).getTime() <= (Date.now())) {
          this.logout()
        }
      }
      catch (Error) {
        this.logout()
      }
      console.log("@@@ ", data)
      console.log("@@@ u", this.configService.username)
      console.log("@@@ p", this.configService.password)
      if (data) {
        await this.authService.employeeLogin({ username: this.configService.username, password: this.configService.password });
      }
    this.configService.themaFilter = null

      // try {
      // } catch (error) {
      //   this.logout()
      // }

    } catch (err) {
      this.logout()
    }
    if (this.configService.avatar === 'null') {
      this.avatar = '../../../assets/img/avatars/avatar_user.jpg';
    } else {
      this.avatar = this.configService.avatar;
    }
    this.shareDataService.castAvatar.subscribe(avatar => {
      if (avatar && avatar !== 'null') {
        this.configService.avatar = this.avatar = avatar;
      }
    })
    this.auth.authenticated.then(async state => {
      if (state) {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
          this.translate.use(event.lang);
          this.listNav = event.translations.nav.nav_items
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    location.reload();
  }

  changeLanguage(lang) {
    if (this.translate.getDefaultLang() !== lang) {
      // this.shareDataService.setListNav(this.listNav);
      this.configService.lang = lang;
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
    } else {
      return;
    }
  }
}
