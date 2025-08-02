import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AccountsComponent } from 'app/pages/accounts/accounts';
import { AccountDetailComponent } from 'app/pages/accounts/account-detail/account';
import { AccountFormComponent } from 'app/forms/account/account-form';

import { ControlsModule } from 'app/controls/controls.module';
import { TransactionsModule } from 'app/transactions/transactions.module';

@NgModule({
    declarations: [
        AccountsComponent,
        AccountDetailComponent,
    ],
    imports: [
        ControlsModule,
        MatIconModule,
        RouterModule,
        TransactionsModule,
        AccountFormComponent,
    ],
    exports: [
        AccountsComponent,
        AccountDetailComponent,
        AccountFormComponent,
    ]
})
export class AccountsModule { }
