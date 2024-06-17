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
    @Input() id: string;
    account: Account;
    errors: string[] = [];

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
        this.accountsService.loaded((accounts: Accounts) => {
            console.log('AccountComponent().ngOnInit() loaded accounts: ', accounts);
            try {
                const account = accounts.byId(this.id);
                if ( account ) {
                    console.log('AccountComponent() ngOnInit() found account: ', account);
                    this.account.update(account);
                } else {
                    this.errors.push(`Account ${this.id} not found.`);
                }
            } catch (e) {
                console.error('Error loading account', e);
                this.errors.push(<string>e);
            }
        });
    }
}
