import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Transactions } from 'app/lib/transactions';

@Injectable({
    providedIn: 'root'
})
export class TransactionsService extends BaseHttpService<Transactions> {
    readonly name = 'transactions';
    readonly endpoint = '/api/transactions';
    cache: Transactions;

    constructor(http: HttpClient) {
        super(http);
        this.cache = new Transactions();
        console.log('new TransactionsService()');
        this.load();
    }

    next(value: Transactions): void {
        this.cache.add(...value);
        this.cacheExpiry = false;
    }
}
