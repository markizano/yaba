import { Subscription } from 'rxjs';

import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { TransactionFilter, Tags } from 'app/lib/types';
import { Transactions, Transaction } from 'app/lib/transactions';
import { Account } from 'app/lib/accounts';

import { AccountsService } from 'app/services/accounts.service';
import { TagsService } from 'app/services/tags.service';
import { BudgetsService } from 'app/services/budgets.service';
import { ControlsModule } from 'app/controls/controls.module';

import { TransactionTableModule } from 'app/tables/transactions/transaction-table/transaction-table.module';
import { TransactionFiltersModule } from 'app/tables/transactions/transaction-filters/transaction-filters.module';
import { BulkActionModule } from './bulk-select-edit/bulk-action.module';
/**
 * This component is a table that displays transactions. It can be filtered, sorted, and paginated.
 *
 * @example
 * <yaba-transaction-list [accountId]="account.id" [filters]="filters" [showFilters]="true" [showPaginate]="true" [editable]="true" [showTags]="true"></yaba-transaction-list>
 */
@Component({
  selector: 'yaba-transaction-list',
  templateUrl: './transactions-list.html',
  styleUrls: ['./transactions-list.css'],
  imports: [
    ControlsModule,
    BulkActionModule,
    TransactionTableModule,
    TransactionFiltersModule,
  ],
})
export class TransactionsListComponent implements OnInit, OnDestroy {

  /**
   * Injected accounts service to have access to the accounts and subsequent
   * transaction data.
   */
  accountsService = inject(AccountsService);

  /**
   * Injected tags service to manage tag operations and budget updates.
   */
  tagsService = inject(TagsService);

  /**
   * Budgets Service keeps communications with the budget table.
   */
  budgetsService: BudgetsService = inject(BudgetsService);
  /**
   * Which Account should we be viewing?
   * This is a data input.
   */
  @Input() accountId?: string;

  /**
   * The filters to apply to the transactions.
   * Don't assign by reference to avoid overwriting the default.
   */
  filters: TransactionFilter = {...EMPTY_TRANSACTION_FILTER};

  /**
   * Internal transaction collection buffer to hold the transactions we would render
   * on the page.
   */
  txns: Transactions = new Transactions();

  /**
   * Internal buffer to hold the list of selected transactions.
   * Only applicable when [editable=true].
   */
  selectedTxns: Transactions = new Transactions();

  /**
   * Private subscription to when account changes outside of this component.
   */
  #acctChg?: Subscription;

  /**
   * Upon instantiation, subscribe to account changes.
   */
  ngOnInit() {
    this.filters = {...EMPTY_TRANSACTION_FILTER};
    if ( !this.accountId ) {
      this.filters.accounts = this.accountsService.get();
    }
    console.log('TransactionsListComponent().ngOnInit()', this.filters);
    this.refreshTransactions();
    this.#acctChg = this.accountsService.subscribe(() => this.refreshTransactions());
  }

  /**
   * Upon destruction, clean up subscriptions.
   */
  ngOnDestroy() {
    this.#acctChg?.unsubscribe();
  }

  /**
   * Anytime the accounts are updated, trigger a re-render of the transactions.
   * Navigate back to page 0.
   * Update the transactions under the updated account details.
   */
  refreshTransactions() {
    console.log('TransactionListComponent().refreshTransactions()', { filters: this.filters });
    if ( this.accountId ) {
      delete this.filters.accounts;
      const account = this.accountsService.get().byId(this.accountId);
      if ( account ) {
        this.txns = account.transactions.getTransactions(this.filters);
      } else {
        throw new Error(`Account ${this.accountId} not found.`);
      }
    } else {
      // this.filters.accounts = [];
      this.txns = this.accountsService.get().getTransactions(this.filters).sorted();
    }
    this.tagsService.refreshFromAccounts(this.accountsService.get());
    this.budgetsService.next(this.txns.getBudgets());
  }

  /**
   * @DEBUG only
   * Render the filters for us to see in the dashboard.
   */
  filtration(filters: TransactionFilter): string {
    // Handle accounts mapping - can be single Account or Accounts array
    let accountsMapping: {id: string, name: string}[] = [];
    if (filters.accounts) {
      if (Array.isArray(filters.accounts)) {
        accountsMapping = filters.accounts.map(x => ({id: x.id, name: x.name}));
      } else {
        // Single account case - cast to Account to access properties
        const singleAccount = filters.accounts as Account;
        accountsMapping = [{id: singleAccount.id, name: singleAccount.name}];
      }
    }

    return JSON.stringify({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      description: filters.description,
      accounts: accountsMapping,
      tags: filters.tags?.toArray(),
      // sort: this.sort,
      page: filters.page,
    });
  }

  /**
   * Handles selection event.
   * If checked, add to the selection list.
   * If unchecked, remove from the list.
   */
  selectionHandler(checked: boolean, txn: Transaction): void {
    console.log(`TransactionListComponent().select(${checked})`, txn);
    if ( checked ) {
      this.selectedTxns.add(txn);
    } else {
      this.selectedTxns.remove(txn);
    }
  }

  /**
   * Tag the selected transactions with the given tag.
   */
  tagTxns(tag: string): void {
    this.selectedTxns.forEach(txn => {
      txn.addTag(tag);
      this.txns.byId(txn.id)?.update(txn);
      this.accountsService.get().byId(txn.accountId)?.transactions.byId(txn.id)?.update(txn);
    });
    this.accountsService.save(this.accountsService.get());
    this.selectedTxns = new Transactions();
    this.refreshTransactions();
  }

  /**
   * Untag the selected transactions with the given tag.
   */
  untagTxns(tags: Tags): void {
    console.log('untag-txns', tags);
    tags.forEach(tag => {
      this.selectedTxns.forEach(txn => {
        txn.removeTag(tag);
        this.txns.byId(txn.id)?.update(txn)
        this.accountsService.get().byId(txn.accountId)?.transactions.byId(txn.id)?.update(txn);
      });
    });
    this.accountsService.save(this.accountsService.get());
    this.selectedTxns = new Transactions();
    this.refreshTransactions();
  }

  /**
   * Delete the given transaction.
   */
  deleteTxn(txn: Transaction): void {
    console.log('delete-txn', txn);
    this.txns.remove(txn);
    this.accountsService.get().byId(txn.accountId)?.transactions.remove(txn);
    this.accountsService.save(this.accountsService.get());
    this.refreshTransactions();
  }

  /**
   * Deletes all selected transactions.
   */
  deleteSelected(): void {
    console.log('delete-selected', this.selectedTxns);
    this.selectedTxns.forEach((txn: Transaction) => {
      try{
        this.txns.remove(txn);
        // I don't want to call (...transactions.update()) because this component's
        // transaction list may be a partial slice of the complete account transactions.
        this.accountsService.get().byId(txn.accountId)?.transactions.remove(txn);
      } catch(e) { console.error(e); }
    });
    this.accountsService.save(this.accountsService.get());
    this.selectedTxns = new Transactions();
    this.refreshTransactions();
  }

  /**
   * Edit the given transaction.
   */
  editTxn(txn: Transaction): void {
    console.log('TransactionListComponent().editTxn()', txn);
    this.accountsService.get().byId(txn.accountId)?.transactions.byId(txn.id)?.update(txn)
    this.accountsService.save(this.accountsService.get());
    this.refreshTransactions();
  }

  /**
   * Cancels current selection response event.
   */
  cancelSelected(): void {
    this.selectedTxns = new Transactions();
  }
}
