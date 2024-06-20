import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from 'app/pages/home/home.component';
import { BudgetingComponent } from 'app/pages/budgeting/budgeting.component';
import { AccountsComponent } from 'app/pages/accounts/accounts.component';
import { AccountDetailComponent } from 'app/pages/accounts/account-detail/account.component';
import { InstitutionsComponent } from 'app/pages/institutions/institutions.component';
import { SettingsComponent } from 'app/pages/settings/settings.component';
import { ChartsComponent } from 'app/pages/charts/charts.component';
import { DevelopComponent } from 'app/pages/develop/develop.component';

export const routeConfig: Routes = [{
    path: '',
    title: 'Home',
    component: HomeComponent,
    children: [],
}, {
    path: 'budgeting',
    title: 'Budgeting',
    component: BudgetingComponent,
}, {
    path: 'institutions',
    title: 'Institutions',
    component: InstitutionsComponent,
}, {
    path: 'accounts',
    title: 'Accounts',
    children: [
        {
            path: '',
            component: AccountsComponent
        },
        {
            path: ':id',
            component: AccountDetailComponent,
        }
    ]
}, {
    path: 'charts',
    title: 'Charts and Graphs',
    component: ChartsComponent,
}, {
    path: 'settings',
    title: 'Settings',
    component: SettingsComponent,
}, {
    path: 'develop',
    title: 'Debugging',
    component: DevelopComponent,
}, {
    path: '**',
    redirectTo: '/'
}];
@NgModule({
  imports: [ RouterModule.forRoot(routeConfig) ],
  exports: [ RouterModule ],
})
export class YabaRoutingModule { }
