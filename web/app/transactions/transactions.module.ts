import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsComponent } from 'app/transactions/transactions.component';
import { TransactionsListComponent } from 'app/transactions-list/transactions-list.component';

import { SortByTxnHeaderPipe } from 'app/sort-by-txn-header.pipe';

@NgModule({
  declarations: [
    TransactionsComponent,
    TransactionsListComponent,
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    ControlsModule,
    SortByTxnHeaderPipe,
  ],
  exports: [
    TransactionsComponent,
    TransactionsListComponent,
  ]
})
export class TransactionsModule { }
