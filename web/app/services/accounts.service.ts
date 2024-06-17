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
        console.log('new AccountsService()');
        this.cache = new Accounts();
    }

    next(value: Accounts): void {
        this.cache.add(...value);
        this.cacheExpiry = false;
    }
}
