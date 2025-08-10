import { EventEmitter, Injectable } from '@angular/core';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Transactions } from 'app/lib/transactions';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService extends BaseHttpService<Transactions> {
  readonly name = 'transactions';
  readonly endpoint = '/api/transactions';
  protected cache: Transactions = new Transactions();
  protected cacheSubject: EventEmitter<Transactions> = new EventEmitter<Transactions>();

  constructor() {
    super();
    console.log('new TransactionsService()');
    this.load();
  }

  next(value: Transactions): void {
    this.cache = Transactions.fromList(value);
    this.cacheExpiry = false;
    this.setExpire();
    this.cacheSubject.emit(this.cache);
  }
}
