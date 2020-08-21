import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DataTable } from 'angular-2-data-table-bootstrap4/dist';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../services/api/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
declare var swal: any;
@Component({
  selector: 'app-favorite-post',
  templateUrl: 'favorite-post.component.html',
  styleUrls: ['./favorite-post.component.scss']
})
export class FavoritePostComponent implements OnInit {
  items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  itemCount: number = 0;
  itemFields: any = ['$all'];
  query: any = {
    filter: {
      state: "APPROVED"
    }
  };
  submitting: boolean = false;
  keyword: string;
  loadingExportExcel: boolean = false;
  type: string = "TODAY";
  @ViewChild('itemsTable') itemsTable: DataTable;

  constructor(
    public ref: ChangeDetectorRef,
    public apiService: ApiService,
    public router: Router,
    public route: ActivatedRoute,
    public titleService: Title,
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Favorite post')
  }

  async reloadItems(params) {
    const { limit, offset, sortBy, sortAsc } = params;
    this.query.limit = limit;
    this.query.offset = offset;
    this.query.order = sortBy ? [
      [sortBy, sortAsc ? 'ASC' : 'DESC']
    ] : null;
    if (!sortBy && !sortAsc) {
      if (this.type === "TODAY") {
        this.query.order = [['view_daily', 'DESC']]
      }
      if (this.type === "LAST_A_WEEK") {
        this.query.order = [['view_weekly', 'DESC']]
      }
      if (this.type === "LAST_A_MONTH") {
        this.query.order = [['view_monthly', 'DESC']]
      }
      if (this.type === "LAST_THREE_MONTHS") {
        this.query.order = [['view_last_3_months', 'DESC']]
      }
    }
    await this.getItems();
  }
  changeTypeSearch() {
    this.itemsTable.reloadItems();
  }
  async getItems() {
    const query = Object.assign({
      fields: this.itemFields
    }, this.query);
    this.items.next(await this.apiService.shop.getList({ query }));
    this.itemCount = this.apiService.shop.pagination.totalItems;
    this.ref.detectChanges();
    return this.items;
  }
  async search() {
    this.submitting = true;
    this.query.filter = {
      state: "APPROVED"

    };

    await this.getItems();
    this.submitting = false;
  }


  async alertDeleteSuccess() {
    return await swal({
      title: 'Delete successful',
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
}
