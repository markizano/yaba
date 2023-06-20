import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YabaComponent } from './yaba.component';
import { AccountsComponent } from './accounts/accounts.component';
import { InstitutionsComponent } from './institutions/institutions.component';

const routes: Routes = [
  { path: '', component: YabaComponent },
  { path: 'institutions', component: InstitutionsComponent },
  { path: 'accounts', component: AccountsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class YabaRoutingModule { }
