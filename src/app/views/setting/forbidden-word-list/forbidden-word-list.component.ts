import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ExcelService } from '../../../services/excel/excel.service';
import { NgForm } from '@angular/forms';
import { ConfigService } from '../../../services/config/config.service';
import { DatePipe } from '@angular/common';

declare var swal: any;
@Component({
  selector: 'app-forbidden-word-list',
  templateUrl: 'forbidden-word-list.component.html',
  styleUrls: ['./forbidden-word-list.component.scss']
})
export class ForbiddenWordListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all'];
  query: any = {};
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
  // keyword: string;
  fieldSearch: string = null;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  searchTimeOut: number = 250;
  id_update: string;
  field: string;
  value: string;
  forbidden_words: any = [];
  word: string;
  word_old: string;
  @ViewChild('itemsTable') itemsTable: DataTable;

  constructor(
    public ref: ChangeDetectorRef,
    public apiService: ApiService,
    public router: Router,
    public route: ActivatedRoute,
    private modalService: BsModalService,
    public titleService: Title,
    public excelService: ExcelService,
    public sanitizer: DomSanitizer,
    private configService: ConfigService,
    private datePipe: DatePipe
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Forbidden word')
    const data: any = await this.apiService.setting.getList({
      query: {
        fields: ['$all'],
        filter: {
          field: "FORBIDDEN_WORDS"
        }
      }
    });
    this.forbidden_words = data[0].value_array;
    this.id_update = data[0].id
    console.log("content ", data)
  }
  openModal2(template: TemplateRef<any>, item) {
    console.log("@#$% ", item)
    this.word = item
    this.word_old = item
    this.modalRef = this.modalService.show(template);
  }
  openModal3(template: TemplateRef<any>) {
    this.word = null
    this.modalRef = this.modalService.show(template);
  }
  openModalEditValue(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.field = item.field
    this.value = item.value
    this.modalRef = this.modalService.show(template);
  }
  async submitEdit(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.editValue(form);
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  async editValue(form: NgForm) {
    try {
      const index = this.forbidden_words.indexOf(this.word_old);

      if (index !== -1) {
        this.forbidden_words[index] = this.word;
      }
      await this.apiService.setting.update(this.id_update, {
        value_array: this.forbidden_words
      });
      this.alertSuccess();
      this.modalRef.hide()
      this.submitting = false;
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }
  async submitAdd(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.addValue(form);
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  async addValue(form: NgForm) {
    try {
      this.forbidden_words.push(this.word);
      await this.apiService.setting.update(this.id_update, {
        value_array: this.forbidden_words
      });
      this.alertSuccess();
      this.modalRef.hide()
      this.submitting = false;
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'H??y nh???p ?????y ????? th??ng tin' : '?????? ????????? ???????????? ???????????????'),
      type: 'warning',
      timer: 2000,
    });
  }

  async reloadItems(params) {
    const { limit, offset, sortBy, sortAsc } = params;
    this.query.limit = limit;
    this.query.offset = offset;
    this.query.order = sortBy ? [
      [sortBy, sortAsc ? 'ASC' : 'DESC']
    ] : null;
    if (!sortBy && !sortAsc) {
      this.query.order = [['updated_at', 'DESC']]
    }
    await this.getItems();
  }
  alertCopied(text) {
    return swal({
      title: `Copied '${text}'`,
      type: 'success',
      timer: 1000,
    });
  }
  spliceText(text: string) {
    return text.slice(0, 8)
  }
  spliceText2(text: string) {
    return text.slice(0, 5) + '...'
  }
  async alertDeleteAccount() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete account' : ((this.configService.lang === 'vn') ? 'Xo?? ng?????i d??ng' : '?????? ??????'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'B???n ch???c ch????' : '????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Success' : ((this.configService.lang === 'vn') ? 'Th??nh c??ng' : '??????'),
      type: 'success',
      timer: 2000,
    });
  }

  alertFailed() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Failed action!' : ((this.configService.lang === 'vn') ? 'Thao t??c th???t b???i.' : '?????????????????????.'),
      type: 'warning',
      timer: 2000,
    });
  }
  async getItems() {
    try {
      let query = Object.assign({
        fields: this.itemFields
      }, this.query);
      this.items.next(await this.apiService.settingUserPermission.getList({ query }));
      let query1 = Object.assign({
        fields: ["$all"]
      }, this.query);
      const countLink: any = await this.apiService.settingUserPermission.count({ query: query1 })
      this.itemCount = countLink;
      this.ref.detectChanges();
      return this.items;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  editItem(item) {
    this.router.navigate(['/setting/setting-user-permission/', item.id], {
      relativeTo: this.route
    });
  }
  async alertDeleteSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete successful' : ((this.configService.lang === 'vn') ? 'X??a th??nh c???ng' : '??????????????? ?????????????????????.'),
      type: 'success',
      timer: 1000,
    });
  }
  async confirmDelete() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete' : ((this.configService.lang === 'vn') ? 'X??a' : '?????????'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to delete?' : ((this.configService.lang === 'vn') ? 'B???n c?? ch???c ch???n mu???n x??a kh??ng?' : '????????? ????????????????'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'X??c nh???n' : '??????'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'K???t th??c' : '??????')
    });
  }
  async deleteItem(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.settingUserPermission.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async deleteWord(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      this.forbidden_words.splice(this.forbidden_words.indexOf(item), 1);
      await this.apiService.setting.update(this.id_update, {
        value_array: this.forbidden_words
      });
      // this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  // async search() {
  //   this.submitting = true;
  //   this.query.filter = {};
  //   if (this.searchRef) { clearTimeout(this.searchRef); }
  //   this.searchRef = setTimeout(async () => {
  //     // if (!this.keyword && !this.fieldSearch) {
  //     //   this.alertNotChooseSearchCondition();
  //     //   this.submitting = false;
  //     //   return;
  //     // }
  //     if (this.keyword === '') {
  //       this.keyword = undefined;
  //     } else {
  //       if (this.keyword.length === 36) {
  //         this.query.filter = { id: this.keyword };
  //       } else {
  //         this.query.filter.$and = [{
  //           $or: {
  //             field: { $iLike: `%${this.field}%` }
  //           }
  //         }]
  //       }
  //     }
  //     // if (this.sex !== null) {
  //     //   this.query.filter.sex = this.sex;
  //     // }
  //     await this.getItems();
  //     this.submitting = false;
  //   }, this.searchTimeOut);
  // }
  // async exportAsXLSX() {
  //   try {
  //     this.loadingExportExcel = true;
  //     const data = await this.apiService.settingUserPermission.getList({
  //       query: {
  //         limit: this.itemCount,
  //         fields: ['$all'],
  //         order: [['updated_at', 'DESC']]
  //       }
  //     });
  //     const data_map = data.map(item => {
  //       return {
  //         id: item.id,
  //         name: item.name
  //       }
  //     });
  //     this.excelService.exportAsExcelFile(data_map, 'link_list');
  //     this.loadingExportExcel = false;
  //   } catch (error) {
  //     this.loadingExportExcel = false;
  //     console.log('error: ', error);
  //   }
  // }

  getDateFromUnixTimestamp(unixtimestamp: any) {
    return new Date(parseInt(unixtimestamp));
  }

  alertNotChooseSearchCondition() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please choose search condition and enter keyword' : ((this.configService.lang === 'vn') ? 'Vui l??ng ch???n ??i???u ki???n t??m ki???m v?? nh???p t??? kh??a' : '?????? ????????? ??????????????????'),
      type: 'warning',
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
