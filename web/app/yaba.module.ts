import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { YabaRoutingModule } from 'app/routing';
import { YabaComponent } from 'app/yaba.component';
import { MenuComponent } from 'app/menu/menu';
import { InstitutionsModule } from 'app/pages/institutions/institutions.module';
import { AccountsModule } from 'app/pages/accounts/accounts.module';
import { ChartsModule } from 'app/pages/charts/charts.module';
import { BudgetingModule } from 'app/pages/budgeting/budgeting.module';
import { SettingsModule } from 'app/pages/settings/settings.module';
import { DevelopComponent } from 'app/pages/develop/develop.component';

// import { SessionManagementService } from './session.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ControlsModule } from 'app/controls/controls.module';
import { ProspectingModule } from './pages/prospecting/prospecting.module';

@NgModule({
  declarations: [
    YabaComponent,
  ],
  imports: [
    // Angular Modules and needs.
    BrowserModule,
    BrowserAnimationsModule,

    // Yaba Modules and global standalone components.
    YabaRoutingModule,
    ControlsModule,
    MenuComponent,

    // Pages as NgModule's.
    InstitutionsModule,
    AccountsModule,
    ChartsModule,
    ProspectingModule,
    BudgetingModule,
    SettingsModule,
    DevelopComponent,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [ YabaComponent ],
  exports: [
    YabaComponent,
  ],
})
export class YabaModule { }
