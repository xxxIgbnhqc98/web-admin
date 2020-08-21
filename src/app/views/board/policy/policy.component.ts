import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { ConfigService } from '../../../services/config/config.service';
declare var swal: any;
@Component({
  selector: 'app-policy',
  templateUrl: 'policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {
  submitting: boolean = false;
  content: string = null;
  id: string;
  constructor(
    public ref: ChangeDetectorRef,
    public apiService: ApiService,
    public router: Router,
    public route: ActivatedRoute,
    public titleService: Title,
    private configService: ConfigService,
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Policy');
    await this.getContent();
  }

  async getContent() {
    try {
      const data: any = await this.apiService.content.getList({
        query: {
          fields: ['$all'],
          filter: {
            type: 'policy'
          }
        }
      });
      this.id = data[0].id;
      this.content = data[0].content;
    } catch (error) {
      this.alertItemNotFound();
    }
  }

  alertItemNotFound() {
    swal({
      title: 'No information found',
      type: 'warning',
      timer: 2000
    });
  }

  async submitEdit(form: NgForm) {
    if (form.valid) {
      await this.edit(form);
    } else {
      this.alertFormNotValid();
    }
  }

  async edit(form) {
    try {
      this.submitting = true;
      const { id, content } = this;
      await this.apiService.content.update(this.id, { id, content });
      this.alertSuccess();
      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }

  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
  }

  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Successfully!' : ((this.configService.lang === 'vn') ? 'Thành công!' : '성공'),
      type: 'success',
      timer: 2000,
    });
  }

  alertErrorFromServer(message) {
    return swal({
      title: message,
      type: 'warning',
      timer: 2000,
    });
  }
}
