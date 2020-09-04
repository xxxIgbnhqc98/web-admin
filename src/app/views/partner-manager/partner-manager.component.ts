import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ExcelService } from '../../services/excel/excel.service';
import { ConfigService } from '../../services/config/config.service';
declare var swal: any;
@Component({
  selector: 'app-partner-manager',
  templateUrl: 'partner-manager.component.html',
  styleUrls: ['./partner-manager.component.scss']
})
export class PartnerManagerComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all'];
  query: any = {};
  submitting: boolean = false;
  keyword: string;
  type: string = null;
  loadingExportExcel: boolean = false;

  @ViewChild('itemsTable') itemsTable: DataTable;

  constructor(
    public ref: ChangeDetectorRef,
    public apiService: ApiService,
    public router: Router,
    public route: ActivatedRoute,
    public titleService: Title,
    public excelService: ExcelService,
    private configService: ConfigService
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Partner manager & Admin')
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

  async getItems() {
    const query = Object.assign({
      fields: this.itemFields
    }, this.query);
    this.items.next(await this.apiService.employee.getList({ query }));
    this.itemCount = this.apiService.employee.pagination.totalItems;
    this.ref.detectChanges();
    return this.items;
  }

  editItem(item) {
    this.router.navigate(['/partner-manager/add/', item.id], {
      relativeTo: this.route
    });
  }

  async search() {
    this.submitting = true;
    this.query.filter = {};
    if (this.keyword && this.keyword !== '') {
      this.itemFields = ['$all'];
      this.query.filter.$or = {
        fullname: {
          $iLike: `%${this.keyword}%`
        },
        username: {
          $iLike: `%${this.keyword}%`
        },
        email: {
          $iLike: `%${this.keyword}%`
        },
        phone: {
          $iLike: `%${this.keyword.replace('(+84)', '')}%`
        }
      };
    }
    if (this.type !== null) {
      this.query.filter.type = this.type;
    }
    await this.getItems();
    this.submitting = false;
  }

  async deleteAll() {
    if (this.itemsTable.selectedRows.length === 0) {
      return;
    }
    const rows = this.itemsTable.selectedRows;
    const ids = [];
    const company_ids = [];
    rows.forEach(row => {
      row.item.deleting = true;
      ids.push(row.item.id);
    });
    try {
      try {
        await this.confirmDelete();
      } catch (err) {
        return;
      }
      await this.apiService.employee.deleteAll(ids);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (err) {
      this.alertErrorFromServer(err.error.message);
    } finally {
      rows.forEach(row => {
        row.item.deleting = false;
      });
    }
  }

  async confirmDelete() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'DELETE' : ((this.configService.lang === 'vn') ? 'Xóa' : '삭제'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to delete?' : ((this.configService.lang === 'vn') ? 'Bạn có chắc chắn muốn xóa không?' : '삭제를 진행할까요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ?'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ?'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }

  async alertDeleteSuccess() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'Delete successful' : ((this.configService.lang === 'vn') ? 'Xóa thành cồng' : '정상적으로 삭제되었습니다.'),
      type: 'success',
      timer: 1000,
    });
  }

  alertErrorFromServer(message) {
    return swal({
      title: message,
      type: 'warning',
      timer: 2000,
    });
  }

  async deleteItem(item) {
    try {
      try {
        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.employee.delete(item.id);
      this.itemsTable.selectAllCheckbox = false;
      this.itemsTable.reloadItems();
      this.alertDeleteSuccess();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }

  async exportAsXLSX() {
    try {
      this.loadingExportExcel = true;
      const all_employee = await this.apiService.employee.getList({
        query: {
          limit: this.itemCount,
          fields: ['$all'],
          order: [['updated_at', 'DESC']]
        }
      });
      const all_employee_map = all_employee.map(employee => {
        return {
          id_code: employee.id,
          fullname: employee.fullname,
          username: employee.username,
          email: employee.email,
          phone: employee.phone,
          type: employee.type
        }
      });
      this.excelService.exportAsExcelFile(all_employee_map, 'Partner mananger & Admin account');
      this.loadingExportExcel = false;
    } catch (error) {
      this.loadingExportExcel = false;
      console.log('error: ', error);
    }
  }
}
