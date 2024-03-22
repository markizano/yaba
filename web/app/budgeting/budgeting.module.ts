import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetingComponent } from './budgeting.component';


@NgModule({
  declarations: [
    BudgetingComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BudgetingComponent,
  ]
})
export class BudgetingModule { }
