import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Accounts } from 'app/lib/accounts';

@Injectable({
    providedIn: 'root'
})
export class AccountsService extends BaseHttpService<Accounts> {
    readonly name = 'accounts';
    readonly endpoint = '/api/accounts';
    protected cache: Accounts;
    protected cacheSubject: EventEmitter<Accounts>;

    constructor(http: HttpClient) {
        super(http);
        this.cache = new Accounts();
        this.cacheSubject = new EventEmitter<Accounts>();
        this.load().subscribe((value: Accounts) => this.next(value));
        console.log('new AccountsService()');
    }

    next(value: Accounts): void {
        this.flush();
        console.log('AccountsService().next(): ', value);
        this.cache.add(...value);
        this.cacheExpiry = false;
        this.setExpire();
        this.cacheSubject.emit(this.cache);
    }
}
