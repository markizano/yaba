import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsComponent } from 'app/transactions/transactions.component';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list.component';

import { YabaTxnPaginationComponent } from 'app/controls/controls.component';

@NgModule({
  declarations: [
    TransactionsComponent,
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    ControlsModule,
    YabaTxnPaginationComponent,
    TransactionsListComponent,
  ],
  exports: [
    TransactionsComponent,
    TransactionsListComponent,
  ]
})
export class TransactionsModule { }
