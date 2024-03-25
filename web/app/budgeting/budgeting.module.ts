import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BudgetingComponent } from 'app/budgeting/budgeting.component';
import { TransactionsModule } from 'app/transactions/transactions.module';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaTableBudgetsComponent } from 'app/tables/budgets/budgets-table.component';

@NgModule({
  declarations: [
    BudgetingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ControlsModule,
    TransactionsModule,
    YabaTableBudgetsComponent,
  ],
  exports: [
    BudgetingComponent,
    YabaTableBudgetsComponent,
  ]
})
export class BudgetingModule { }
