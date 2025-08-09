import { Subscription } from 'rxjs';

import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    inject
} from '@angular/core';

import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Budgets, TransactionFilter } from 'app/lib/types';
import { Transactions, Transaction } from 'app/lib/transactions';
import { YabaAnimations } from 'app/lib/animations';

import { AccountsService } from 'app/services/accounts.service';
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
    animations: [
        YabaAnimations.fadeSlideDown()
    ],
    imports: [
        ControlsModule,
        BulkActionModule,
        TransactionTableModule,
        TransactionFiltersModule,
    ],
})
export class TransactionsListComponent implements OnInit, OnDestroy, AfterViewInit {

  /**
   * Event emitter of the budgets found for the transactions found in this scope
   * as defined by the filter.
   * This is a data output.
   */
  @Output() budgetsChange = new EventEmitter<Budgets>();

  /**
   * Which Account should we be viewing?
   * This is a data input.
   */
  @Input() accountId?: string;

  /**
   * The filters to apply to the transactions.
   * This is a bidriectional data structure that defines which transactions are
   * visible in the view.
   */
  @Input() filters = EMPTY_TRANSACTION_FILTER;
  @Output() filtersChange = new EventEmitter<TransactionFilter>();

  /**
   * Injected accounts service to have access to the accounts and subsequent
   * transaction data.
   */
  accountsService = inject(AccountsService);

  /**
   * Reference to this element for html-class tracking.
   */
  ref: ElementRef = inject(ElementRef);

  /**
   * Allow the user to edit the transactions in place.
   * This is a behaviour input.
   */
  editable: boolean = false;

  /**
   * Truncate the description to 30 characters for neater display (since I can't figure out the css)
   * This is a behaviour input.
   * Add class="truncate" to truncate description and merchant fields.
   */
  truncate: boolean = false;

  /**
   * Determins if the transaction filters component is rendered.
   * Include a class=filtered in order to render the transaction filters.
   * This is a behaviour input of sorts.
   */
  showFilters: boolean = false;

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

  constructor() {
      console.log('new TransactionsListComponent()');
  }

  /**
   * Upon instantiation, subscribe to account changes.
   */
  ngOnInit() {
      console.log('TransactionsListComponent().ngOnInit()');
      this.accountsChange();
      this.#acctChg = this.accountsService.subscribe(() => this.accountsChange());
  }

  /**
   * Upon destruction, clean up subscriptions.
   */
  ngOnDestroy() {
      this.#acctChg?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.editable = this.ref.nativeElement.classList.contains('editable');
    this.truncate = this.ref.nativeElement.classList.contains('truncate');
    this.showFilters = this.ref.nativeElement.classList.contains('filtered');
  }

  /**
   * Anytime the accounts are updated, trigger a re-render of the transactions.
   * Navigate back to page 0.
   * Update the transactions under the updated account details.
   */
  accountsChange() {
      console.log('TransactionListComponent().accountsChange()', { filters: this.filters });
      if ( this.accountId ) {
          const account = this.accountsService.get().byId(this.accountId);
          if ( account ) {
              this.txns = account.transactions.getTransactions(this.filters);
          } else {
              throw new Error(`Account ${this.accountId} not found.`);
          }
      } else {
          this.txns = Transactions.fromList(this.accountsService.get().map(a => a.transactions.getTransactions(this.filters)).flat()).sorted();
      }
      this.budgetsChange.emit( this.txns.getBudgets() );
  }

  /**
   * @DEBUG only
   * Render the filters for us to see in the dashboard.
   */
  filtration(filters: TransactionFilter): string {
      return JSON.stringify({
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          description: filters.description,
          accounts: filters.accounts?.map(x => ({id: x.id, name: x.name})),
          tags: filters.tags,
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
      this.selectedTxns.setTag(tag);
      this.selectedTxns = new Transactions();
      this.budgetsChange.emit( this.txns.getBudgets() );
  }

  /**
   * Untag the selected transactions with the given tag.
   */
  untagTxns(tags: string[]): void {
      console.log('untag-txns', tags);
      tags.forEach(tag => this.selectedTxns.removeTag(tag));
      this.selectedTxns = new Transactions();
      this.budgetsChange.emit( this.txns.getBudgets() );
  }

  /**
   * Delete the given transaction.
   */
  deleteTxn(txn: Transaction): void {
      if ( this.editable ) {
          console.log('delete-txn', txn);
          this.txns.remove(txn);
          this.accountsService.get().byId(txn.accountId)?.transactions.remove(txn);
          this.accountsService.save(this.accountsService.get());
          this.budgetsChange.emit( this.txns.getBudgets() );
      }
  }

  /**
   * Deletes all selected transactions.
   */
  deleteSelected(): void {
      if ( this.editable ) {
          console.log('delete-selected', this.selectedTxns);
          this.selectedTxns.forEach((txn: Transaction) => {
              try{ this.deleteTxn(txn); } catch(e) { console.error(e); }
          });
          this.selectedTxns = new Transactions();
      }
  }

  /**
   * Edit the given transaction.
   */
  editTxn(txn: Transaction): void {
      console.log('TransactionListComponent().editTxn()', txn);
      this.accountsService.get().byId(txn.accountId)?.transactions.byId(txn.id)?.update(txn)
      this.accountsService.save(this.accountsService.get());
      this.budgetsChange.emit( this.txns.getBudgets() );
  }

  /**
   * Cancels current selection response event.
   */
  cancelSelected(): void {
      this.selectedTxns = new Transactions();
  }
}
