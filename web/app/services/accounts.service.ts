import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Accounts } from 'app/lib/accounts';

@Injectable({
    providedIn: 'root'
})
export class AccountsService extends BaseHttpService<Accounts> {
    readonly name = 'accounts';
    readonly endpoint = '/api/accounts';
    cache: Accounts;

    constructor(http: HttpClient) {
        super(http);
        this.cache = new Accounts();
        console.log('new AccountsService()');
        this.load();
    }

    next(value: Accounts): void {
        console.log('AccountsService().next()', value);
        this.cache.add(...value);
        this.cacheExpiry = false;
    }
}
