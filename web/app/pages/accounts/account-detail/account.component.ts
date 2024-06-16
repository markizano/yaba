import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Account, Accounts } from 'app/lib/accounts';
import { AccountsService } from 'app/services/accounts.service';
/**
 * This component is responsible for displaying the details of a single account.
 */
@Component({
    selector: 'yaba-account',
    templateUrl: './account.component.html',
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

    /**
     * Load the account from the filesystem or server.
     */
    ngOnInit() {
        console.log('AccountComponent() ngOnInit()');
        if (this.id) {
            this.accountsService.load().then(
                (accounts: Accounts) => {
                    try {
                        const account = (new Accounts(...accounts)).byId(this.id) as Account;
                        if ( account ) {
                            console.log('AccountComponent() ngOnInit() found account: ', account);
                            this.account.update(account);
                        }
                    } catch (e) {
                        console.error('Error loading account', e);
                        this.error = <string>e;
                    }
                }, (error) => {
                    console.error('Error loading account', error);
                    this.error = error;
                }
            );
        }
    }
}
