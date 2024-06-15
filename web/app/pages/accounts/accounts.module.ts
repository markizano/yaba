import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';

import { AccountsComponent } from 'app/pages/accounts/accounts.component';
import { AccountComponent } from 'app/pages/accounts/account-detail/account.component';
import { AccountFormComponent } from 'app/forms/account/account-form.component';

import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsModule } from 'app/transactions/transactions.module';

@NgModule({
    declarations: [
        AccountsComponent,
        AccountComponent,
    ],
    imports: [
        ControlsModule,
        MatGridListModule,
        RouterModule,
        TransactionsModule,
        AccountFormComponent,
    ],
    exports: [
        AccountsComponent,
        AccountComponent,
        AccountFormComponent,
    ]
})
export class AccountsModule { }
