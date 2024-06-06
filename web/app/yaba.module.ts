import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { YabaRoutingModule } from 'app/routing';
import { YabaComponent } from 'app/yaba.component';
import { MenuComponent } from 'app/menu/menu.component';
import { InstitutionsModule } from 'app/institutions/institutions.module';
import { AccountsModule } from 'app/accounts/accounts.module';
import { ChartsModule } from 'app/charts/charts.module';
import { BudgetingModule } from 'app/budgeting/budgeting.module';
import { SettingsModule } from 'app/settings/settings.module';
import { YabaDropFileDirective } from './dropfile.directive';

@NgModule({
  declarations: [
    YabaComponent,
  ],
  imports: [
    BrowserModule,
    YabaRoutingModule,
    MenuComponent,
    InstitutionsModule,
    AccountsModule,
    ChartsModule,
    BudgetingModule,
    SettingsModule,
    YabaDropFileDirective,
  ],
  providers: [],
  bootstrap: [ YabaComponent ]
})
export class YabaModule { }
