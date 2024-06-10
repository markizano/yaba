import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { ControlsModule } from 'app/controls/controls.module';
import { AccountsComponent } from 'app/pages/accounts/accounts.component';
import { AccountFormComponent } from 'app/forms/account/account-form.component';
import { TransactionsModule } from 'app/transactions/transactions.module';

@NgModule({
  declarations: [
    AccountsComponent,
  ],
  imports: [
    MatGridListModule,
    ControlsModule,
    TransactionsModule,
    AccountFormComponent,
  ],
  exports: [
    AccountsComponent,
    AccountFormComponent,
  ]
})
export class AccountsModule { }
