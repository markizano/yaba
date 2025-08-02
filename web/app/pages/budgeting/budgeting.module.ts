import { NgModule } from '@angular/core';

import { BudgetingComponent } from 'app/pages/budgeting/budgeting';
import { TransactionsModule } from 'app/transactions/transactions.module';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaTableBudgetsComponent } from 'app/tables/budgets/budgets-table';

@NgModule({
  declarations: [
    BudgetingComponent,
  ],
  imports: [
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
