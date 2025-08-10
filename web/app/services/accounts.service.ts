import { EventEmitter, Injectable, inject } from '@angular/core';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Accounts } from 'app/lib/accounts';
import { BudgetsService } from 'app/services/budgets.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService extends BaseHttpService<Accounts> {
  readonly name = 'accounts';
  readonly endpoint = '/api/accounts';
  protected cache: Accounts = new Accounts();
  protected cacheSubject: EventEmitter<Accounts> = new EventEmitter<Accounts>();

  // Inject BudgetsService to keep budgets in sync
  protected budgetsService = inject(BudgetsService);

  constructor() {
    super();
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
