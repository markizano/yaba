import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, inject, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Transaction } from 'app/lib/transactions';

import { NgSelectable, TransactionType } from 'app/lib/types';

@Component({
  selector: 'yaba-transaction-type',
  standalone: false,
  templateUrl: './transaction-type.html',
  styleUrl: './transaction-type.css',
  providers: [{ // Enables the use of [(ngModel)] to be passed to this component.
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TransactionTypeComponent),
    multi: true
  }],
})
export class TransactionTypeComponent implements ControlValueAccessor, AfterViewInit {
  /**
   * HTML element reference to detect attributes and classList.
   */
  ref: ElementRef = inject(ElementRef);

  /**
   * Inform Angular that we have changed stuff here so it can run its detection again.
   */
  chDet: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() value: TransactionType = TransactionType.UNKNOWN;

  // ControlValueAccessor implementation
  // Outputs a string=transactionType
  onChange = (_: TransactionType) => {};
  onTouched = () => {};

  /**
   * Controls disable state.
   */
  disabled: boolean = false;

  /**
   * Attribute detector for enable multiple accounts to be selected.
   */
  multiple: boolean = false;

  /**
   * Attribute detector for this field being required in forms.
   */
  required: boolean = false;

  /**
   * Allows form flow control with which tab index this field is.
   */
  tabIndex: number|null = null;

  transactionTypes: NgSelectable<TransactionType>[] = Transaction.Types();

  ngAfterViewInit(): void {
    this.multiple = this.ref.nativeElement.classList.contains('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required');
    this.tabIndex = this.ref.nativeElement.getAttribute('tabindex');
    this.chDet.detectChanges();
  }

  /* BEGIN: [(ngModel)] handler methods */
  writeValue(value: TransactionType): void {
      this.value = value || TransactionType.UNKNOWN;
  }

  registerOnChange(fn: any): void {
      this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
      this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
  }
  /* END: [(ngModel)] handler methods */

  /**
   * Handle change events from ng-select and bridge to ControlValueAccessor
   * @param value Selected transaction type value
   */
  changed(value: NgSelectable<TransactionType>) {
    this.value = value.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
