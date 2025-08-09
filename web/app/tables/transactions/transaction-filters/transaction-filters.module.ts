import { NgModule } from '@angular/core';

import { ControlsModule } from 'app/controls/controls.module';
import { DateRangeFilterComponent } from 'app/tables/transactions/transaction-filters/daterange/daterange';
import { AccountSelectorComponent } from 'app/tables/transactions/transaction-filters/account-selector/account-selector';
import { DescriptionFilterComponent } from 'app/tables/transactions/transaction-filters/description/description';
import { TagsSelectorComponent } from 'app/tables/transactions/transaction-filters/tags-selector/tags-selector';
import { TransactionFilterComponent } from 'app/tables/transactions/transaction-filters/transaction-filter';

@NgModule({
  declarations: [
    DateRangeFilterComponent,
    AccountSelectorComponent,
    DescriptionFilterComponent,
    TagsSelectorComponent,
    TransactionFilterComponent,
  ],
  imports: [
    ControlsModule,
  ],
  exports: [
    DateRangeFilterComponent,
    AccountSelectorComponent,
    DescriptionFilterComponent,
    TagsSelectorComponent,
    TransactionFilterComponent,
  ]
})
export class TransactionFilterModule { }
