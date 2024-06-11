import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from 'app/pages/home/home.component';
import { BudgetingComponent } from 'app/pages/budgeting/budgeting.component';
import { AccountsComponent } from 'app/pages/accounts/accounts.component';
import { AccountComponent } from 'app/pages/account/account.component';
import { InstitutionsComponent } from 'app/pages/institutions/institutions.component';
import { SettingsComponent } from 'app/pages/settings/settings.component';
import { ChartsComponent } from 'app/pages/charts/charts.component';

export const routeConfig: Routes = [
  {
    path: '',
    title: 'Home',
    component: HomeComponent,
    children: [ ],
  },
  {
    path: 'budgeting',
    title: 'Budgeting',
    component: BudgetingComponent,
  },
  {
    path: 'institutions',
    title: 'Institutions',
    component: InstitutionsComponent,
  },
  {
    path: 'accounts',
    title: 'Accounts',
    component: AccountsComponent,
    children: [
      {
        path: ':id',
        component: AccountComponent,
      },
    ]
  },
  {
    path: 'charts',
    title: 'Charts and Graphs',
    component: ChartsComponent,
  },
  {
    path: 'settings',
    title: 'Settings',
    component: SettingsComponent,
  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routeConfig) ],
  exports: [ RouterModule ],
})
export class YabaRoutingModule { }
