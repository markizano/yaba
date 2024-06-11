import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { iStorables, BaseHttpService } from 'app/services/basehttp.service';
import { Account, Accounts } from 'app/lib/accounts';

@Injectable({
    providedIn: 'root'
})
export class AccountsService extends BaseHttpService<Account, Accounts> implements iStorables<Accounts> {
    readonly name = 'accounts';

    constructor(http: HttpClient) {
        super(http);
        console.log('new AccountsService()');
        this.load();
    }

    getEndpoint(): string {
        return '/api/accounts';
    }
}
