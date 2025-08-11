import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { YabaAnimations } from 'app/lib/animations';
import { Settings } from 'app/lib/settings';
import { Transaction, Transactions } from 'app/lib/transactions';
import { TransactionShowHeaders, TxnSortHeader } from 'app/lib/types';
import { TagsService } from 'app/services/tags.service';
import { AccountsService } from 'app/services/accounts.service';

@Component({
  selector: 'yaba-transaction-table',
  standalone: false,
  templateUrl: './transaction-table.html',
  styleUrl: './transaction-table.css',
  animations: [ YabaAnimations.fadeSlideDown() ],
})
export class TransactionTableComponent {
  /**
   * Injected services for managing tags and accounts.
   */
  protected tagsService = inject(TagsService);
  protected accountsService = inject(AccountsService);

  /**
   * Internal transaction collection buffer to hold the transactions we would render
   * on the page.
   */
  @Input() txns = new Transactions();
  @Output() txnsChange = new EventEmitter<Transactions>();

  /**
   * When a single transaction/row is updated.
   * Makes it easier to track which one updated without having to iterate over the list.
   */
  @Output() txnChange = new EventEmitter<Transaction>();

  /**
   * Allow the user to edit the transactions in place.
   * This is a behaviour input.
   * Add class="editable" to make this table editable.
   */
  @Input() editable: boolean = false;

  /**
   * Truncate the description to 30 characters for neater display (since I can't figure out the css)
   * This is a behaviour input.
   * Add class="truncate" to truncate description and merchant fields.
   */
  @Input() truncate: boolean = false;

  /**
   * Determins if the paginator is rendered.
   * This is a behaviour input of sorts.
   * Add attribute "paginate" to show the paginator.
   */
  @Input() paginate: boolean = false;

  /**
   * Internal page tracker.
   * Data structure that represents the page, size and how many items to render.
   */
  page: PageEvent = { pageIndex: 0, pageSize: 10, length: 0 };

  /**
   * Show the transaction headers (date, description, etc.)
   * This is a behaviour input.
   */
  txShow: TransactionShowHeaders = Settings.fromLocalStorage().txShow;

  /**
   * Data structure to tell us which header and direction to sort the transactions.
   */
  sort: TxnSortHeader = {column: 'datePosted', asc: true};

  /**
   * Internal buffer to hold the list of selected transactions.
   * Only applicable when [editable=true].
   */
  @Input() selectedTxns = new Transactions();
  @Output() selectedTxnsChange: EventEmitter<Transactions> = new EventEmitter<Transactions>();

  /**
   * Generate the list of rows to display on the current page based on page count.
   * Used to create a fixed number of rows based on the paginator settings.
   */
  genRows(): number[] {
    return Array.from(Array(Math.min(this.txns.length, this.page.pageSize)).keys()).map(x => x + (this.page.pageIndex * this.page.pageSize));
  }

  /**
   * Sort the transactions by the given header.
   */
  sortBy(header: keyof Transaction): void {
    this.sort.asc = this.sort.column == header? !this.sort.asc: true;
    this.sort.column = header;
    this.page0();
  }

  /**
   * Return to page 0.
   */
  page0() {
    this.turnPage({pageIndex: 0, pageSize: this.page.pageSize, length: this.txns.length});
  }

  /**
   * Turn page event handler.
   * @param {PageEvent} $event
   */
  turnPage($event: PageEvent): void {
    // if the page size is changed, reset the page to 0.
    if ($event.pageSize != this.page.pageSize) {
        $event.pageIndex = 0;
    }
    this.page = $event;
  }

  /**
   * Handles selection event.
   * If checked, add to the selection list.
   * If unchecked, remove from the list.
   */
  selectionHandler(checked: boolean, txn: Transaction): void {
    console.log(`TransactionTableComponent().select(${checked})`, txn);
    if ( checked ) {
      this.selectedTxns.add(txn);
    } else {
      this.selectedTxns.remove(txn);
    }
    this.selectedTxnsChange.emit(this.selectedTxns);
  }

  /**
   * Handles when a transaction is changed in the row.
   * This is just a passthru and not a data handler.
   */
  rowChange(txn: Transaction): void {
    this.txns.byId(txn.id)!.update(txn);
    this.txnsChange.emit(this.txns);
    this.txnChange.emit(txn);
  }

  /**
   * Delete the given transaction.
   * This is just a passthru and not a data handler.
   */
  deleteTxn(txn: Transaction): void {
    console.log('delete-txn', txn);
    this.txns.remove(txn);
    this.txnsChange.emit(this.txns);
  }
}
