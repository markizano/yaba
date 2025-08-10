import { EventEmitter, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Accounts } from 'app/lib/accounts';
import { BudgetsService } from 'app/services/budgets.service';

@Injectable({
    providedIn: 'root'
})
export class AccountsService extends BaseHttpService<Accounts> {
    readonly name = 'accounts';
    readonly endpoint = '/api/accounts';
    protected cache: Accounts;
    protected cacheSubject: EventEmitter<Accounts>;

    // Inject BudgetsService to keep budgets in sync
    private budgetsService = inject(BudgetsService);

    constructor(http: HttpClient) {
        super(http);
        this.cache = new Accounts();
        this.cacheSubject = new EventEmitter<Accounts>();
        this.load().subscribe((value: Accounts) => this.next(value));
        console.log('new AccountsService()');
    }

    next(value: Accounts): void {
        // console.log('AccountsService().next(): ', value);
        this.cache = Accounts.fromList(value)
        this.cacheExpiry = false;
        this.setExpire();
        this.cacheSubject.emit(this.cache);

        // Refresh budgets whenever accounts change
        this.budgetsService.refreshFromAccounts(this.cache);
    }
}
