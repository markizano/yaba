import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Account, Accounts, IAccount } from 'app/lib/accounts';
import { AccountsService } from 'app/services/accounts.service';
/**
 * This component is responsible for displaying the details of a single account.
 */
@Component({
    selector: 'yaba-account',
    templateUrl: './account.component.html',
    providers: [Router, AccountsService],
})
export class AccountComponent {
    @Input() public id: string;
    account: Account;
    error?: string;

    constructor(protected router: Router, protected accountsService: AccountsService) {
        console.log('AccountComponent constructor');
        this.id = this.router.url.split('/').pop() ?? '';
        this.account = new Account();
    }

    ngOnInit() {
        console.log('AccountComponent() ngOnInit()');
        if (this.id) {
            this.accountsService.load().then(
                (accounts: Accounts) => {
                    this.account.update(<IAccount>accounts.byId(this.id));
                }, (error) => {
                    console.error('Error loading account', error);
                    this.error = error;
                }
            );
        }
    }
}
