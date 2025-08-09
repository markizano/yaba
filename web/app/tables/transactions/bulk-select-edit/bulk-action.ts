import { Component, EventEmitter, Input, Output } from '@angular/core';

import { YabaAnimations } from 'app/lib/animations';
import { Transactions } from 'app/lib/transactions';
import { Tags } from 'app/lib/types';

@Component({
  selector: 'yaba-bulk-action',
  standalone: false,
  templateUrl: './bulk-action.html',
  styleUrls: ['./bulk-action.css'],
  animations: [ YabaAnimations.fadeSlideDown() ],
})
export class BulkAction {

  /**
   * Internal buffer to hold the list of selected transactions.
   * Only applicable when [editable=true].
   */
  @Input() selectedTxns: Transactions = new Transactions();
  @Output() selectedTxnsChange: EventEmitter<Transactions> = new EventEmitter<Transactions>();

  @Output() tagTransactions: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleteTransactions: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancelSelection: EventEmitter<void> = new EventEmitter<void>();
  @Output() untagTransactions: EventEmitter<Tags> = new EventEmitter<Tags>();

  /**
   * Tag the selected transactions with the given tag.
   */
  tagTxns(tag: string): void {
    this.tagTransactions.emit(tag);
  }

  /**
   * Deletes all selected transactions.
   */
  deleteSelected(): void {
    console.log('BulkAction().deleteSelected()', this.selectedTxns);
    this.deleteTransactions.emit();
  }

  /**
   * Reset the transaction list by cancelling the selection.
   */
  cancelSelected() {
    this.cancelSelection.emit();
  }

  /**
   * Remove a tag from the transactions.
   */
  untagTxns(tags: Tags) {
    this.untagTransactions.emit(tags);
  }
}
