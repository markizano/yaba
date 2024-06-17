import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Accounts } from 'app/lib/accounts';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AccountsService extends BaseHttpService<Accounts> {
    readonly name = 'accounts';
    readonly endpoint = '/api/accounts';
    cache: Accounts;
    override cacheSubject: BehaviorSubject<Accounts>;

    constructor(http: HttpClient) {
        super(http);
        this.cache = new Accounts();
        this.cacheSubject = new BehaviorSubject<Accounts>(this.cache);
        console.log('new AccountsService()');
        this.cacheSubject.subscribe((value) => this.next(value));
    }

    next(value: Accounts): void {
        this.flush();
        this.cache.add(...value);
        this.cacheExpiry = false;
        this.setExpire();
    }
}
