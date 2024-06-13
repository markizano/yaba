import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { iStorables, BaseHttpService } from 'app/services/basehttp.service';
import { Transaction, Transactions } from 'app/lib/transactions';

@Injectable({
    providedIn: 'root'
})
export class TransactionsService extends BaseHttpService<Transaction, Transactions> implements iStorables<Transactions> {
    readonly name = 'transactions';

    constructor(http: HttpClient) {
        super(http);
        console.log('new TransactionsService()');
    }

    getEndpoint(): string {
        return '/api/transactions';
    }
}
