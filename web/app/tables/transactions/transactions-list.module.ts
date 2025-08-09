import { NgModule } from '@angular/core';
import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsListComponent } from './transactions-list';
import { TransactionFiltersModule } from './transaction-filters/transaction-filters.module';
import { TransactionTableModule } from './transaction-table/transaction-table.module';



@NgModule({
  declarations: [],
  imports: [
    ControlsModule,
    TransactionFiltersModule,
    TransactionTableModule,
    TransactionsListComponent,
  ],
  exports: [
    TransactionFiltersModule,
    TransactionTableModule,
    TransactionsListComponent,
  ],
})
export class TransactionsListModule { }
