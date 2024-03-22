import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { ControlsModule } from 'app/controls/controls.module';

import { TransactionsComponent } from 'app/transactions/transactions.component';
import { TransactionsListComponent } from 'app/transactions-list/transactions-list.component';

@NgModule({
  declarations: [
    TransactionsComponent,
    TransactionsListComponent,
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    ControlsModule,
  ],
  exports: [
    TransactionsComponent,
    TransactionsListComponent
  ]
})
export class TransactionsModule { }
