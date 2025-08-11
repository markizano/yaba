import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { Settings } from 'app/lib/settings';

import { Transaction } from 'app/lib/transactions';
import { TransactionShowHeaders } from 'app/lib/types';

/**
 * A row in a table that represents a transaction.
 * This component is a container for a list of <txn-field> components.
 * If the actions column is to be rendered:
 * - If the table is editable, render the actions to save/cancel.
 * - If the table is read-only, render the actions to select, edit or delete a txn.
 * Optionally show columns based on $txShow.
 * Allow the CRUD actions to passthru from cell to row.
 */
@Component({
    selector: '.yaba-txn-row',
    templateUrl: './txn-row.html',
    styleUrls: ['./txn-row.css'],
    standalone: false,
})
export class TxnRowComponent {

  @Input() txn = new Transaction();
  @Output() txnChange = new EventEmitter<Transaction>();
  // Backup transaction if we decide to cancel the edit.
  #bTxn = new Transaction();

  /**
   * This is just a boolean indicator this row has been selected.
   * The parent is responsible for tracking which was picked.
   */
  @Input() select: boolean = false;
  @Output() selectChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Notification events about dropping this transaction row or budgets changing.
   */
  @Output() dropRow: EventEmitter<void> = new EventEmitter<void>();

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

  @HostBinding('class.editing') editing = false;

  txShow: TransactionShowHeaders = Settings.fromLocalStorage().txShow;

  save(txn: Transaction): void {
    this.editing = false;
    this.txnChange.emit(txn);
  }

  cancel(): void {
    console.log('cancel-edit-txn');
    this.editing = false;
    this.txn = this.#bTxn;
  }

  edit(): void {
    console.log('TxnRowComponent.edit()');
    // create a backup transaction, but don't copy by reference.
    this.#bTxn = Transaction.fromObject(this.txn);
    this.editing = true;
  }

  dropTxn(): void {
    this.dropRow.emit();
  }

  selectTxn(selected: boolean): void {
    this.selectChange.emit(selected);
  }
}
