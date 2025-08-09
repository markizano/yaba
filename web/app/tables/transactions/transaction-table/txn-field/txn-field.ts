import { Subscription } from 'rxjs';

import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEvent, MatChipInputEvent } from '@angular/material/chips';

import { NgSelectable, TransactionType } from 'app/lib/types';
import { Transaction } from 'app/lib/transactions';
import { Accounts } from 'app/lib/accounts';
import { AccountsService } from 'app/services/accounts.service';

/**
 * One field to rule them all.
 * This master field type takes a transaction and which field you want it to display and it will render that field as a <td> element.
 * <txn-field> is synonymous with <td> in a table with ✨features✨ to help us render the correct data type and handle editing seamlessly.
 */
@Component({
  selector: '.yaba-txn-field',
  standalone: false,
  templateUrl: './txn-field.html',
  styleUrls: ['./txn-field.css'],
})
export class TxnFieldComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * ReadOnly constants for key codes.
   * Used in the HTML template for `matChipInputSeparatorKeyCodes`.
   */
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  /**
   * Host element reference for detecting which classes are associated for behaviour identification.
   */
  ref: ElementRef = inject(ElementRef);

  /**
   * TWo-way binding of the transaction field we're associating.
   */
  @Input() txn = new Transaction();
  @Output() txnChange = new EventEmitter<Transaction>();

  /**
   * Notification event for when to rebalance the budgets.
   */
  @Output() budgetsChange = new EventEmitter<void>();

  /**
   * The name of the field to which we are bound.
   */
  field: keyof Transaction = 'id';

  /**
   * Class-based behaviour trackers.
   */
  truncate: boolean = false;
  editing: boolean = false;

  accounts: Accounts = new Accounts();
  accountsService: AccountsService = inject(AccountsService);
  #acct?: Subscription;

  ngOnInit(): void {
    const update = (accounts: Accounts) => {
      this.accounts = accounts;
    };
    update(this.accountsService.get());
    this.#acct = this.accountsService.subscribe(update);
  }

  ngOnDestroy(): void {
    this.#acct?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.editing = this.ref.nativeElement.classList.contains('editing');
    this.truncate = this.ref.nativeElement.classList.contains('truncate');
    this.field = this.ref.nativeElement.getAttribute('field');
  }

  getTransactionTypes(): NgSelectable<TransactionType>[] {
    return [
      { value: TransactionType.Credit, label: 'Credit' },
      { value: TransactionType.Debit, label: 'Debit' },
      { value: TransactionType.Transfer, label: 'Transfer' },
      { value: TransactionType.Payment, label: 'Payment' },
    ];
  }

  add($event: MatChipInputEvent) {
    this.txn.addTag($event.value);
    this.txnChange.emit(this.txn);
    $event.chipInput.clear();
    this.budgetsChange.emit();
  }

  remove($event: MatChipEvent) {
    this.txn.removeTag($event.chip.value);
    this.txnChange.emit(this.txn);
    this.budgetsChange.emit();
  }

  edit(prevVal: string, $event: MatChipEvent) {
    this.txn.removeTag(prevVal);
    this.txn.addTag($event.chip.value);
    this.txnChange.emit(this.txn);
    this.budgetsChange.emit();
  }

  dateChange(txnField: 'datePending' | 'datePosted', $event: Date): void {
    this.txn[txnField] = $event;
    this.txnChange.emit(this.txn);
  }
}
