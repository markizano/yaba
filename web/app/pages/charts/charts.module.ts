import { NgModule } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';

import { ChartsComponent } from 'app/pages/charts/charts';
import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsModule } from 'app/transactions/transactions.module';
import { TransactionFilterComponent } from 'app/tables/transactions/txn-filter/txn-filter';


@NgModule({
  declarations: [
    ChartsComponent,
  ],
  imports: [
    ControlsModule,
    TransactionsModule,
    TransactionFilterComponent,
    GoogleChartsModule,
  ],
  exports: [
    ChartsComponent,
  ]
})
export class ChartsModule { }
