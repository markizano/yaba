import { NgModule } from "@angular/core";

import { ProspectingComponent } from "app/pages/prospecting/prospecting";
import { WishlistComponent } from "app/pages/prospecting/wishlist/wishlist";
import { TransactionStatsComponent } from "app/pages/prospecting/transaction-stats/transaction-stats";

import { ControlsModule } from "app/controls/controls.module";
import { TransactionsModule } from 'app/transactions/transactions.module';

@NgModule({
  declarations: [
    ProspectingComponent,
    WishlistComponent,
    TransactionStatsComponent,
  ],
  imports: [
    ControlsModule,
    TransactionsModule,
  ],
  exports: [
    ProspectingComponent
  ]
})
export class ProspectingModule { }
