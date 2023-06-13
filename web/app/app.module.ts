import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InstitutionsComponent } from './institutions/institutions.component';
import { AccountsComponent } from './accounts/accounts.component';

import { Account } from './accounts';
import { Institution } from './institutions';
import { Transaction } from './transactions';


@NgModule({
  declarations: [
    AppComponent,
    InstitutionsComponent,
    AccountsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
