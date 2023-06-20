import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { YabaRoutingModule } from './routing';
import { YabaComponent } from './yaba.component';

import { InstitutionsComponent } from './institutions/institutions.component';
import { AccountsComponent } from './accounts/accounts.component';

@NgModule({
  declarations: [
    YabaComponent,
    InstitutionsComponent,
    AccountsComponent
  ],
  imports: [
    BrowserModule,
    YabaRoutingModule
  ],
  providers: [],
  bootstrap: [YabaComponent]
})
export class YabaModule { }
