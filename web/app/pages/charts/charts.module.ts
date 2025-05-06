import { NgModule } from '@angular/core';

import { ChartsComponent } from 'app/pages/charts/charts.component';
import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsModule } from 'app/transactions/transactions.module';
import { TransactionFilterComponent } from 'app/tables/transactions/txn-filter/txn-filter.component';


@NgModule({
  declarations: [
    ChartsComponent,
  ],
  imports: [
    ControlsModule,
    TransactionsModule,
    TransactionFilterComponent,
  ],
  exports: [
    ChartsComponent,
  ]
})
export class ChartsModule { }
