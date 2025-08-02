import { Routes } from '@angular/router';

import { HomeComponent } from 'app/pages/home/home';
import { BudgetingComponent } from 'app/pages/budgeting/budgeting';
import { AccountsComponent } from 'app/pages/accounts/accounts';
import { AccountDetailComponent } from 'app/pages/accounts/account-detail/account';
import { InstitutionsComponent } from 'app/pages/institutions/institutions';
import { SettingsComponent } from 'app/pages/settings/settings';
import { ChartsComponent } from 'app/pages/charts/charts';
import { ProspectingComponent } from 'app/pages/prospecting/prospecting';
import { DevelopComponent } from 'app/pages/develop/develop';

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
    path: 'prospect',
    title: 'Planning and Prospecting',
    component: ProspectingComponent,
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
