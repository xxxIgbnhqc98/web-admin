import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { ConfigService } from '../../../services/config/config.service';
declare var swal: any;
@Component({
  selector: 'app-how-to-use',
  templateUrl: 'how-to-use.component.html',
  styleUrls: ['./how-to-use.component.scss']
})
export class HowToUseComponent implements OnInit {
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
    this.titleService.setTitle('How to use');
    await this.getContent();
  }

  async getContent() {
    try {
      const data: any = await this.apiService.content.getList({
        query: {
          fields: ['$all'],
          filter: {
            type: 'how-to-use'
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
  occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    let n = 0,
      pos = 0,
      step = allowOverlapping ? 1 : subString.length;

    while (true) {
      pos = string.indexOf(subString, pos);
      if (pos >= 0) {
        ++n;
        pos += step;
      } else break;
    }
    return n;
  }
  async edit(form) {
    try {
      this.submitting = true;
      const { id, content } = this;
      const countImg = this.occurrences(content, "img src", true)
      if (countImg > 10) {
        this.alertErrorFromServer("Maximum 10 pictures can be uploaded");
      } else {
        await this.apiService.content.update(this.id, { id, content });
        this.alertSuccess();
      }
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
