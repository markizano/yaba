import { NgModule } from '@angular/core';
import { GoogleChartsModule } from 'angular-google-charts';

import { ChartsComponent } from 'app/pages/charts/charts';
import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsModule } from 'app/transactions/transactions.module';


@NgModule({
  declarations: [
    ChartsComponent,
  ],
  imports: [
    ControlsModule,
    TransactionsModule,
    GoogleChartsModule,
  ],
  exports: [
    ChartsComponent,
  ]
})
export class ChartsModule { }
