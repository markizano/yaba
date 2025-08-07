import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { ControlsModule } from 'app/controls/controls.module';
import { TransactionFilterModule } from 'app/tables/transactions/transaction-filters/transaction-filter.module';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    ControlsModule,
    TransactionFilterModule,
    TransactionsListComponent,
  ],
  exports: [
    TransactionFilterModule,
    TransactionsListComponent,
  ]
})
export class TransactionsModule { }
