import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../services/config/config.service';


declare var swal: any;
@Component({
  selector: 'app-content',
  templateUrl: 'content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  type: string;
  content: any;
  constructor(private authService: AuthService,
    private router: Router,
    public apiService: ApiService,
    public titleService: Title,
    private route: ActivatedRoute,
    private configService: ConfigService) {

  }

  async ngOnInit() {
    this.titleService.setTitle('Policies');
    this.route.params.subscribe(async params => {
      this.type = params.type;
    })
    const data: any = await this.apiService.content.getList({
      query: {
        fields: ['$all'],
        filter: {
          type: this.type
        }
      }
    });
    this.content = data[0].content;
    console.log("content ", data)
    // await this.getContent();
  }

  async getContent() {
    try {
      const data: any = await this.apiService.content.getList({
        query: {
          fields: ['$all'],
          filter: {
            type: this.type
          }
        }
      });
      this.content = data[0].content;
      console.log("content ", this.content)
    } catch (error) {
      this.alertItemNotFound();
    }
  }
  async renderHtml(html_code, $sce) {
    return $sce.trustAsHtml(html_code);
  }
  alertItemNotFound() {
    swal({
      title: 'No information found',
      type: 'warning',
      timer: 2000
    });
  }
  async submitLogin(form: NgForm) {
    if (form.valid) {
      await this.login(form);
    } else {
      this.alertFormNotHaveValid();
    }
  }

  async login(form: NgForm) {
    try {
      const { type } = this;
      await this.authService.getContent(type);
      this.toDashboard();
    } catch (error) {
      this.alertErrorFormServer(error.error.message);
    }
  }

  toDashboard() {
    this.router.navigate(['dashboard']);
  }

  alertFormNotHaveValid() {
    swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000
    });
  }

  alertErrorFormServer(message) {
    swal({
      title: message,
      type: 'warning',
      timer: 2000
    });
  }
}
