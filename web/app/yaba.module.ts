import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { YabaRoutingModule } from './routing';

import { YabaComponent } from './yaba.component';
import { MenuComponent } from './menu/menu.component';
import { InstitutionsModule } from './institutions/institutions.module';
// import { AccountComponent } from './account/account.component';
// import { ChartsComponent } from './charts/charts.component';
// import { SettingsComponent } from './settings/settings.component';
// import { BudgetingComponent } from './budgeting/budgeting.component';

@NgModule({
  declarations: [
    YabaComponent,
  ],
  imports: [
    BrowserModule,
    YabaRoutingModule,
    MenuComponent,
    InstitutionsModule,
    // AccountComponent,
    // ChartsComponent,
    // SettingsComponent,
    // BudgetingComponent,
  ],
  providers: [],
  bootstrap: [ YabaComponent ]
})
export class YabaModule { }
