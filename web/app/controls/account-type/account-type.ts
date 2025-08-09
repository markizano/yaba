import { AfterViewInit, Component, ElementRef, forwardRef, inject, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { Account, AccountTypes } from 'app/lib/accounts';
import { NgSelectable } from 'app/lib/types';

@Component({
  selector: 'yaba-account-type',
  standalone: false,
  templateUrl: './account-type.html',
  styleUrl: './account-type.css',
  providers: [{ // Enables the use of [(ngModel)] to be passed to this component.
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AccountTypesComponent),
    multi: true
  }],
})
export class AccountTypesComponent implements ControlValueAccessor, AfterViewInit {
  @Input() value: keyof AccountTypes | null = null;

  ref: ElementRef = inject(ElementRef);

  // ControlValueAccessor implementation
  // Outputs a string=accountType
  onChange = (_: keyof AccountTypes | null) => {};
  onTouched = () => {};
  disabled: boolean = false;

  multiple: boolean = false;
  required: boolean = false;
  tabIndex: number|null = null;

  accountTypes: NgSelectable<AccountTypes>[] = Account.Types();

  ngAfterViewInit(): void {
    this.multiple = this.ref.nativeElement.classList.contains('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required')
    this.tabIndex = this.ref.nativeElement.getAttribute('tabindex')
  }

  /* BEGIN: [(ngModel)] handler methods */
  writeValue(value: keyof AccountTypes): void {
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
   * @param value Selected account type value
   */
  changed(value: keyof AccountTypes | null) {
    this.value = value;
    this.onChange(this.value);
    this.onTouched();
  }
}
