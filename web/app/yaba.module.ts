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
// import { SessionManagementService } from './session.service';
import { HttpClientModule } from '@angular/common/http';
import { ControlsModule } from 'app/controls/controls.module';

@NgModule({
  declarations: [
    YabaComponent,
  ],
  imports: [
    BrowserModule,
    YabaRoutingModule,
    MenuComponent,
    ControlsModule,
    InstitutionsModule,
    AccountsModule,
    ChartsModule,
    BudgetingModule,
    SettingsModule,
    HttpClientModule,
  ],
//   providers: [
//     SessionManagementService,
//   ],
  bootstrap: [ YabaComponent ],
  exports: [
    YabaComponent,
    ControlsModule,
  ],
})
export class YabaModule { }
