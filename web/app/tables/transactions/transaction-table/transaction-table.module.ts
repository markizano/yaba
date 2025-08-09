import { NgModule } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import { ControlsModule } from 'app/controls/controls.module';
import { TxnRowComponent } from 'app/tables/transactions/transaction-table/txn-row/txn-row';
import { TxnFieldComponent } from 'app/tables/transactions/transaction-table/txn-field/txn-field';
import { TransactionTableComponent } from 'app/tables/transactions/transaction-table/transaction-table';
import { TxnEditDirective } from 'app/tables/transactions/transaction-table/txn-edit/txn-edit.directive';
import { TransactionSampleComponent } from '../transaction-sample/transaction-sample';

@NgModule({
  declarations: [
    TxnRowComponent,
    TxnFieldComponent,
    TransactionTableComponent,
    TransactionSampleComponent,
  ],
  imports: [
    ControlsModule,
    MatPaginator,
    TxnEditDirective,
  ],
  exports: [
    TxnRowComponent,
    TransactionTableComponent,
    TransactionSampleComponent,
  ],
})
export class TransactionTableModule { }
