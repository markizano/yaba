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

  @Input() value: keyof TransactionType | null = null;

  ref: ElementRef = inject(ElementRef);
  chDet: ChangeDetectorRef = inject(ChangeDetectorRef);

  // ControlValueAccessor implementation
  // Outputs a string=transactionType
  onChange = (_: keyof TransactionType | null) => {};
  onTouched = () => {};
  disabled: boolean = false;

  multiple: boolean = false;
  required: boolean = false;
  tabIndex: number|null = null;

  transactionTypes: NgSelectable<TransactionType>[] = Transaction.Types();

  ngAfterViewInit(): void {
    this.multiple = this.ref.nativeElement.classList.contains('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required');
    this.tabIndex = this.ref.nativeElement.getAttribute('tabindex');
    this.chDet.detectChanges();
  }

  /* BEGIN: [(ngModel)] handler methods */
  writeValue(value: keyof TransactionType): void {
      this.value = value;
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
  changed(value: keyof TransactionType | null) {
    this.value = value;
    this.onChange(this.value);
    this.onTouched();
  }
}
