import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { routeConfig } from './routing';

import { YabaComponent } from './yaba.component';
import { InstitutionsComponent } from './institutions/institutions.component';
import { AccountsComponent } from './accounts/accounts.component';

@NgModule({
  declarations: [
    YabaComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routeConfig),
    InstitutionsComponent,
    AccountsComponent,
  ],
  providers: [],
  bootstrap: [ YabaComponent ]
})
export class YabaModule { }
