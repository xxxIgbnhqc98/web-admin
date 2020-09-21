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
declare var $: any;
import * as _ from 'lodash';
declare var swal: any;
@Component({
  selector: 'app-bulletin-list',
  templateUrl: 'bulletin-list.component.html',
  styleUrls: ['./bulletin-list.component.scss']
})
export class BulletinComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all', { "user": ["$all"] }];
  query: any = {};
  submitting: boolean = false;
  listCommentOfConversation: any = [];

  submittingUpdate: boolean = false;
  submittingSend: boolean = false;
  keyword: string;
  fieldSearch: string = null;
  loadingExportExcel: boolean = false;
  searchRef: any;
  modalRef: BsModalRef;
  zoom_image: string;
  searchTimeOut: number = 250;
  post_id: string;
  page_list_comments: number = 1;
  load_more: boolean = false;
  loading_api: boolean = false;
  limit_list_comments: number = 10;
  count_list_comments: number = 0;
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
    this.titleService.setTitle('Bulletin list')
  }
  openComment(template: TemplateRef<any>, user) {
    this.post_id = user.id
    this.modalRef = this.modalService.show(template);
  }
  openModalZoomImage(template: TemplateRef<any>, item) {
    this.modalRef = this.modalService.show(template);
    this.zoom_image = item.replace('300', '1024')
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
      this.items.next(await this.apiService.bulletin.getList({ query }));
      let query1 = Object.assign({
        fields: ["$all"]
      }, this.query);
      const countLink: any = await this.apiService.bulletin.count({ query: query1 })
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
      await this.apiService.bulletin.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  async deleteComment(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.comment.delete(item.id);
      this.reloadAfterDeleteComment();
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
              content: { $iLike: `%${this.keyword}%` }
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
      const data = await this.apiService.bulletin.getList({
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
  async reloadAfterDeleteComment() {
    try {
      this.loading_api = true;
      this.page_list_comments = 1;
      this.listCommentOfConversation = await this.apiService.comment.getList({
        query: {
          fields: ['$all', { 'user': ['$all', '$paranoid'] }, { 'comment_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
          filter: { post_id: this.post_id, parent_id: null },
          order: [['created_at_unix_timestamp', 'DESC']],
          limit: this.limit_list_comments,
          page: this.page_list_comments
        }
      });
      this.listCommentOfConversation.forEach(element => {
        element.comment_childs = _.orderBy(element.comment_childs, ['created_at_unix_timestamp'], ['asc']);
      });
      // this.listCommentOfConversation.reverse();
      this.count_list_comments = this.apiService.comment.pagination.totalItems;
      this.ref.detectChanges();
      await this.autoScroll();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  async getListCommentOfConversation(template, item) {
    try {
      this.loading_api = true;
      this.page_list_comments = 1;
      this.post_id = item.id

      this.modalRef = this.modalService.show(template);
      this.listCommentOfConversation = await this.apiService.comment.getList({
        query: {
          fields: ['$all', { 'user': ['$all', '$paranoid'] }, { 'comment_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
          filter: { post_id: this.post_id, parent_id: null },
          order: [['created_at_unix_timestamp', 'DESC']],
          limit: this.limit_list_comments,
          page: this.page_list_comments
        }
      });
      this.listCommentOfConversation.forEach(element => {
        element.comment_childs = _.orderBy(element.comment_childs, ['created_at_unix_timestamp'], ['asc']);
      });
      // this.listCommentOfConversation.reverse();
      this.count_list_comments = this.apiService.comment.pagination.totalItems;
      this.ref.detectChanges();
      await this.autoScroll();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  async autoScroll() {
    $(document).ready(function () {
      var itemList = document.getElementById("msg_history");
      itemList.scrollTop = itemList.scrollHeight;
    })
  }
  async onScrollDown() {
    this.load_more = true;
    await this.loadMoreListComment();
    this.load_more = false;
  }
  async loadMoreListComment() {
    try {
      if (this.listCommentOfConversation.length < this.count_list_comments) {
        this.page_list_comments = this.page_list_comments + 1;
        console.log("#@$%% ", this.page_list_comments)
        const res = await this.apiService.comment.getList({
          query: {
            fields: ['$all', { 'user': ['$all', '$paranoid'] }, { 'comment_childs': ['$all', { 'user': ['$all', '$paranoid'] }] }],
            filter: { post_id: this.post_id, parent_id: null },
            order: [['created_at_unix_timestamp', 'DESC']],
            limit: this.limit_list_comments,
            page: this.page_list_comments
          }
        });
        this.listCommentOfConversation.forEach(element => {
          element.comment_childs = _.orderBy(element.comment_childs, ['created_at_unix_timestamp'], ['asc']);
        });
        const old_res: any = this.listCommentOfConversation
        this.listCommentOfConversation = [...old_res, ...res];
        // this.listCommentOfConversation.reverse();
      }
    } catch (error) {

    }
  }
}
