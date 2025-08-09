import { NgModule } from '@angular/core';

import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsListModule } from 'app/tables/transactions/transactions-list.module';

@NgModule({
  imports: [
    ControlsModule,
    TransactionsListModule,
  ],
  exports: [
    TransactionsListModule,
  ],
})
export class TransactionsModule { }
