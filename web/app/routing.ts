import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from 'app/home/home.component';
import { AccountsComponent } from 'app/accounts/accounts.component';
import { AccountComponent } from './account/account.component';
import { InstitutionsComponent } from 'app/institutions/institutions.component';
import { SettingsComponent } from './settings/settings.component';
import { ChartsComponent } from './charts/charts.component';

export const routeConfig: Routes = [
  {
    path: '',
    title: 'Home',
    component: HomeComponent,
    children: [ ],
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
