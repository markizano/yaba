import { NgModule } from '@angular/core';

import { ControlsModule } from 'app/controls/controls.module';

import { BulkAction } from 'app/tables/transactions/bulk-select-edit/bulk-action';
import { TagTransactionsComponent } from 'app/tables/transactions/bulk-select-edit/txn-tag';
import { UntagTransactionComponent } from 'app/tables/transactions/bulk-select-edit/txn-untag';
import { TransactionFiltersModule } from 'app/tables/transactions/transaction-filters/transaction-filters.module';

@NgModule({
  declarations: [
    BulkAction,
    TagTransactionsComponent,
    UntagTransactionComponent,
  ],
  imports: [
    ControlsModule,
    TransactionFiltersModule,
  ],
  exports: [
    TagTransactionsComponent,
    UntagTransactionComponent,
    BulkAction,
  ],
})
export class BulkActionModule { }
