import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AppComponent } from './app.component';
import { DefaultLayoutComponent } from './containers';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
import { AppRoutingModule } from './app.routing';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { AppHeaderModule } from '../assets/core-ui/header';
import { AppBreadcrumbModule } from '../assets/core-ui/breadcrumb';
import { AppSidebarModule } from '../assets/core-ui/sidebar';
import { AppFooterModule } from '../assets/core-ui/footer';
import { AppAsideModule } from '../assets/core-ui/aside';
import { ServicesModule } from './services';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { LaddaModule } from 'angular2-ladda';
import { FormsModule } from '@angular/forms';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { UserChangePasswordComponent } from './views/user-change-password/user-change-password.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from './shared';
import { ToolBoxComponent } from './views/tool-box/tool-box.component';
import { QuillModule } from 'ngx-quill';
import { ContentComponent } from './views/content/content.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}
const APP_CONTAINERS = [
  DefaultLayoutComponent
];

@NgModule({
  imports: [
    FroalaEditorModule.forRoot(), 
    FroalaViewModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    QuillModule,
    ChartsModule,
    ServicesModule,
    HttpClientModule,
    LaddaModule,
    FormsModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    ToolBoxComponent,
    ContentComponent,
    UserChangePasswordComponent,
    
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: PathLocationStrategy
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
