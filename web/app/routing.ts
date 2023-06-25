import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YabaComponent } from './yaba.component';
import { AccountsComponent } from './accounts/accounts.component';
import { InstitutionsComponent } from './institutions/institutions.component';

export const routeConfig: Routes = [
  { path: '/', component: YabaComponent },
  { path: '/institutions', component: InstitutionsComponent },
  { path: '/accounts', component: AccountsComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routeConfig) ],
  exports: [ RouterModule ],
})
export class YabaRoutingModule { }
