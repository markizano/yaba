import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { Account, Accounts } from "app/lib/accounts";

@Component({
    selector: 'yaba-accounts',
    templateUrl: './account-filter.component.html',
    styles: [ ],
    standalone: true,
    imports: [ CommonModule, FormsModule ],
})
export class YabaFilterAccountsComponent {
  @Input() accounts: Accounts;
  @Output() selectedAccounts: EventEmitter<Account[]> = new EventEmitter<Account[]>();

  constructor() {
    this.accounts = new Accounts();
  }

  /**
   * I use a separate event to only notify of selected accounts instead of changing the
   * underlying bound account list to maintain the list box in the DOM/UI.
   * @param accounts {IAccount} Accounts selected by end-user
   */
  changed(accounts: Account[]) {
    this.selectedAccounts.emit(accounts);
  }
}
