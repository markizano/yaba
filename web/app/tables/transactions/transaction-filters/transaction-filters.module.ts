import { NgModule } from '@angular/core';

import { ControlsModule } from 'app/controls/controls.module';
import { DateRangeFilterComponent } from 'app/tables/transactions/transaction-filters/daterange/daterange';
import { DescriptionFilterComponent } from 'app/tables/transactions/transaction-filters/description/description';
import { TagsSelectorComponent } from 'app/tables/transactions/transaction-filters/tags-selector/tags-selector';
import { TransactionFiltersComponent } from 'app/tables/transactions/transaction-filters/transaction-filters';

@NgModule({
  declarations: [
    DateRangeFilterComponent,
    DescriptionFilterComponent,
    TagsSelectorComponent,
    TransactionFiltersComponent,
  ],
  imports: [
    ControlsModule,
  ],
  exports: [
    DateRangeFilterComponent,
    DescriptionFilterComponent,
    TagsSelectorComponent,
    TransactionFiltersComponent,
  ]
})
export class TransactionFiltersModule { }
