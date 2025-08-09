import { NgModule } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import { ControlsModule } from 'app/controls/controls.module';
import { TxnRowComponent } from 'app/tables/transactions/transaction-table/txn-row/txn-row';
import { TxnFieldComponent } from 'app/tables/transactions/transaction-table/txn-field/txn-field';
import { TransactionTableComponent } from 'app/tables/transactions/transaction-table/transaction-table';
import { TxnEditDirective } from 'app/tables/transactions/transaction-table/txn-edit/txn-edit.directive';

@NgModule({
  declarations: [
    TxnRowComponent,
    TxnFieldComponent,
    TransactionTableComponent,
  ],
  imports: [
    ControlsModule,
    MatPaginator,
    TxnEditDirective,
  ],
  exports: [
    TxnRowComponent,
    TransactionTableComponent,
    TxnEditDirective,
  ],
})
export class TransactionTableModule { }
