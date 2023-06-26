import { Injectable } from '@angular/core';
import { Accounts, IAccount } from 'app/lib/accounts';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  public accounts?: Accounts;
  constructor() {
    console.log('AccountsService constructor');
    this.accounts = new Accounts();
  }
}
