import { NgModule } from "@angular/core";

import { ProspectingComponent } from "app/pages/prospecting/prospecting.component";
import { WishlistComponent } from "app/tables/wishlist/wishlist.component";

import { ControlsModule } from "app/controls/controls.module";
import { TransactionsModule } from 'app/transactions/transactions.module';
import { TxnStatsComponent } from "app/tables/txn-stats/txn-stats.component";

@NgModule({
    declarations: [
        ProspectingComponent,
    ],
    imports: [
        ControlsModule,
        TransactionsModule,
        WishlistComponent,
        TxnStatsComponent,
    ],
    exports: [
        ProspectingComponent
    ]
})
export class ProspectingModule { }
