import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef, ElementRef } from '@angular/core';
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
import * as _ from 'lodash'

declare var swal: any;
@Component({
  selector: 'app-setting-list',
  templateUrl: 'setting-list.component.html',
  styleUrls: ['./setting-list.component.scss']
})
export class SettingListComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all'];
  query: any = {
    filter: {
      field: { "$notIn": ["APP_ICON", "APP_SCRIPT", "APP_NAME", "LEVEL_LIST"] }
    }
  };
  submitting: boolean = false;
  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
  keyword: string;
  fieldSearch: string = null;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  searchTimeOut: number = 250;
  id_update: string;
  field: string;
  value: string;
  value_array_obj: any;
  value_array_obj_point: any;
  lang: string;
  country_color: string;
  loadingUploadAvatar: boolean = false;
  @ViewChild('itemsTable') itemsTable: DataTable;
  @ViewChild('fileAvatar') fileAvatarElementRef: ElementRef;

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
    this.titleService.setTitle('Link list')
    this.lang = this.configService.lang
  }
  changeValue($event, index) {
    this.value_array_obj[index].id = $event.target.value
  }
  changeValuePoint($event, index) {
    this.value_array_obj_point[index].point = $event.target.value
    console.log("this.value_array_obj_point ", this.value_array_obj_point)
  }
  changeValueLimit($event, index) {
    this.value_array_obj_point[index].limit_per_day = $event.target.value
    console.log("this.value_array_obj_point ", this.value_array_obj_point)

  }
  addCircle() {
    let newNum = 0
    if (this.value_array_obj.length > 0) {
      newNum = parseInt(_.orderBy(this.value_array_obj, [item => parseInt(item.id_num)], ['desc'])[0].id_num) + 1;
    }
    const newC: any = {
      id_num: newNum.toString(),
      id: '',
      color: '#000000'
    }
    this.value_array_obj.unshift(newC)
  }
  deleteCircle(index) {
    this.value_array_obj.splice(index, 1)
  }
  replaceNhay(text) {
    return text.replace(/"/g, "'")
  }
  openModalEditValue(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.field = item.field
    this.value = item.value
    this.modalRef = this.modalService.show(template);
  }
  openModalEarningPoint(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.field = item.field
    this.value_array_obj_point = item.value_array_obj
    this.modalRef = this.modalService.show(template);
  }
  openModalCountry(template: TemplateRef<any>, item) {
    this.id_update = item.id
    this.field = item.field
    this.value_array_obj = item.value_array_obj
    this.modalRef = this.modalService.show(template);
  }
  async submitEdit(form: NgForm) {
    this.submittingUpdate = true;
    if (form.valid) {
      await this.editValue(form);
    } else {
      this.alertFormNotValid();
      this.submittingUpdate = false;
    }
  }
  changeColor(index, color) {
    if (color.match('rgba')) {
      color = this.rgb2hex(color)
    }
    this.value_array_obj[index].color = color
    console.log("@#@#@#@3 ", this.value_array_obj)
  }
  rgb2hex(orig) {
    var a, isPercent,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ? "#" +
        (rgb[1] | 1 << 8).toString(16).slice(1) +
        (rgb[2] | 1 << 8).toString(16).slice(1) +
        (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
    if (alpha !== "") {
      isPercent = alpha.indexOf("%") > -1;
      a = parseFloat(alpha);
      if (!isPercent && a >= 0 && a <= 1) {
        a = Math.round(255 * a);
      } else if (isPercent && a >= 0 && a <= 100) {
        a = Math.round(255 * a / 100)
      } else {
        a = "";
      }
    }
    if (a) {
      hex += (a | 1 << 8).toString(16).slice(1);
    }
    return hex;
  }
  async submitEditCountry(form: NgForm) {
    this.submittingUpdate = true;
    if (form.valid) {
      await this.editValueContry(form);
    } else {
      this.alertFormNotValid();
      this.submittingUpdate = false;
    }
  }

  async editValueContry(form: NgForm) {
    try {

      await this.apiService.setting.update(this.id_update, {
        value_array_obj: this.value_array_obj
      });

      this.alertSuccess();
      this.modalRef.hide()
      this.submittingUpdate = false;
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submittingUpdate = false;
    }
  }
  async editValuePoint(form: NgForm) {
    try {

      await this.apiService.setting.update(this.id_update, {
        value_array_obj: this.value_array_obj_point
      });

      this.alertSuccess();
      this.modalRef.hide()
      this.submittingUpdate = false;
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submittingUpdate = false;
    }
  }
  async editValue(form: NgForm) {
    try {

      await this.apiService.setting.update(this.id_update, {
        value: this.value
      });

      this.alertSuccess();
      this.modalRef.hide()
      this.submittingUpdate = false;
      this.itemsTable.reloadItems();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submittingUpdate = false;
    }
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
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
      title: (this.configService.lang === 'en') ? 'Delete account' : ((this.configService.lang === 'vn') ? 'Xoá người dùng' : '계정 삭제'),
      text: (this.configService.lang === 'en') ? 'Are you sure?' : ((this.configService.lang === 'vn') ? 'Bạn chắc chứ?' : '확실한가요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Success' : ((this.configService.lang === 'vn') ? 'Thành công' : '성공'),
      type: 'success',
      timer: 2000,
    });
  }

  alertFailed() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Failed action!' : ((this.configService.lang === 'vn') ? 'Thao tác thất bại.' : '실패되었습니다.'),
      type: 'warning',
      timer: 2000,
    });
  }
  async getItems() {
    try {
      let query = Object.assign({
        fields: this.itemFields
      }, this.query);
      this.items.next(await this.apiService.setting.getList({ query }));
      let query1 = Object.assign({
        fields: ["$all"]
      }, this.query);
      const countLink: any = await this.apiService.setting.count({ query: query1 })
      this.itemCount = countLink;
      this.ref.detectChanges();
      return this.items;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  editItem(item) {
    this.router.navigate(['/link/add/', item.id], {
      relativeTo: this.route
    });
  }
  async alertDeleteSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete successful' : ((this.configService.lang === 'vn') ? 'Xóa thành cồng' : '정상적으로 삭제되었습니다.'),
      type: 'success',
      timer: 1000,
    });
  }
  async confirmDelete() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'DELETE' : ((this.configService.lang === 'vn') ? 'Xóa' : '삭제'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to delete?' : ((this.configService.lang === 'vn') ? 'Bạn có chắc chắn muốn xóa không?' : '삭제를 진행할까요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  async deleteItem(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.setting.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async search() {
    this.submitting = true;
    this.query.filter = {};
    if (this.searchRef) { clearTimeout(this.searchRef); }
    this.searchRef = setTimeout(async () => {
      // if (!this.keyword && !this.fieldSearch) {
      //   this.alertNotChooseSearchCondition();
      //   this.submitting = false;
      //   return;
      // }
      if (this.keyword === '') {
        this.keyword = undefined;
      } else {
        if (this.keyword.length === 36) {
          this.query.filter = { id: this.keyword };
        } else {
          this.query.filter.$and = [{
            $or: {
              field: { $iLike: `%${this.field}%` }
            }
          }]
        }
      }
      // if (this.sex !== null) {
      //   this.query.filter.sex = this.sex;
      // }
      await this.getItems();
      this.submitting = false;
    }, this.searchTimeOut);
  }
  async exportAsXLSX() {
    try {
      this.loadingExportExcel = true;
      const data = await this.apiService.setting.getList({
        query: {
          limit: this.itemCount,
          fields: ['$all'],
          order: [['updated_at', 'DESC']]
        }
      });
      const data_map = data.map(item => {
        return {
          id: item.id,
          name: item.name
        }
      });
      this.excelService.exportAsExcelFile(data_map, 'link_list');
      this.loadingExportExcel = false;
    } catch (error) {
      this.loadingExportExcel = false;
      console.log('error: ', error);
    }
  }

  getDateFromUnixTimestamp(unixtimestamp: any) {
    return new Date(parseInt(unixtimestamp));
  }

  alertNotChooseSearchCondition() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please choose search condition and enter keyword' : ((this.configService.lang === 'vn') ? 'Vui lòng chọn điều kiện tìm kiếm và nhập từ khóa' : '검색 조건을 선택해주세요'),
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
  uploadAvatar(event) {
    this.loadingUploadAvatar = true;
    try {
      const file = event.srcElement.files[0];
      const result = this.apiService.fileUploader.uploadImage(file, 300)
        .then(result => {
          this.value = result.url;
          this.loadingUploadAvatar = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeAvatar() {
    this.value = null;
  }
}
