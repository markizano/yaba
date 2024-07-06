import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";

import { Account, Accounts } from "app/lib/accounts";
import { AccountsService } from "app/services/accounts.service";
import { NgSelectable } from "app/lib/types";
import { Subscription } from "rxjs";
/**
 * I needed a way to take a list of accounts and filter them by the end-user's selection.
 * This is a space or gap in the operation, a transitor of sorts, that will enable me to display a list of
 * accounts we have in the system and allow the end-user to select one or more of them.
 * An event is fired upon selection casting the list of selected accounts to the parent component.
 * In this way, the original list won't change and the user's selection can be interpreted by the
 * system.
 */
@Component({
    selector: 'yaba-accounts',
    templateUrl: './account-filter.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule, NgSelectModule ],
})
export class AccountsFilterComponent {
    accounts = new Accounts();
    selectable: NgSelectable<Account>[] = [];
    @Output() selectedAccounts = new EventEmitter<Accounts>();
    #cacheUpdate?: Subscription;

    constructor(protected accountsService: AccountsService) { }

    ngOnInit() {
        const update = (accounts: Accounts) => {
            this.accounts = accounts;
            this.selectable = this.accounts.map((x: Account) => ({ label: x.name, value: x }));
            // console.log('AccountsFilterComponent().selectable:', this.selectable);
        };
        update(this.accountsService.get());
        this.#cacheUpdate = this.accountsService.subscribe(update);
    }

    ngOnDestroy() {
        this.#cacheUpdate?.unsubscribe();
    }

    /**
     * I use a separate event to only notify of selected accounts instead of changing the
     * underlying bound account list to maintain the list box in the DOM/UI.
     * @param accounts {IAccount} Accounts selected by end-user
     */
    changed(accounts: Account[]) {
        this.selectedAccounts.emit(new Accounts(...accounts));
    }
}
