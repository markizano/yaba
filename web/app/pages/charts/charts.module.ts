import { NgModule } from '@angular/core';

import { ChartsComponent } from 'app/pages/charts/charts.component';
import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsModule } from 'app/transactions/transactions.module';


@NgModule({
  declarations: [
    ChartsComponent,
  ],
  imports: [
    ControlsModule,
    TransactionsModule,
  ],
  exports: [
    ChartsComponent,
  ]
})
export class ChartsModule { }
