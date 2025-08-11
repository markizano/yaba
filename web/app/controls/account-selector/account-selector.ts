import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, inject, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";

import { Accounts } from "app/lib/accounts";
import { AccountsService } from "app/services/accounts.service";

/**
 * I needed a way to take a list of accounts and filter them by the end-user's selection.
 * This is a space or gap in the operation, a transitor of sorts, that will enable me to display a list of
 * accounts we have in the system and allow the end-user to select one or more of them.
 * An event is fired upon selection casting the list of selected accounts to the parent component.
 * In this way, the original list won't change and the user's selection can be interpreted by the
 * system.
 */
@Component({
    selector: 'yaba-account-selector',
    templateUrl: './account-selector.html',
    styleUrls: ['./account-selector.css'],
    standalone: false,
    providers: [{ // Enables the use of [(ngModel)] to be passed to this component.
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AccountSelectorComponent),
        multi: true
    }]
})
export class AccountSelectorComponent implements ControlValueAccessor, AfterViewInit {
  /**
   * HTML element reference to detect attributes and classList.
   */
  ref: ElementRef = inject(ElementRef);

  /**
   * Inform Angular that we have changed stuff here so it can run its detection again.
   */
  chDet: ChangeDetectorRef = inject(ChangeDetectorRef);

  /**
   * Access to the accounts to list.
   */
  accountsService: AccountsService = inject(AccountsService);

  /**
   * [(ngModel)] value to return.
   */
  @Input() value: Accounts = new Accounts();

  /**
   * Placeholder for the accounts we've retrieved.
   */
  accounts = new Accounts();

  // ControlValueAccessor implementation
  onChange = (_: Accounts) => {};
  onTouched = () => {};
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
   * Private subscription to account changes.
   */
  #accts?: Subscription;

  ngOnInit() {
    const update = (accounts: Accounts) => {
      this.accounts = accounts;
    };
    update(this.accountsService.get());
    this.#accts = this.accountsService.subscribe(update);
  }

  ngOnDestroy() {
      this.#accts?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.multiple = this.ref.nativeElement.hasAttribute('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required');
    this.chDet.detectChanges();
  }

  /* BEGIN: [(ngModel)] handler methods */
  writeValue(value: Accounts): void {
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
   * I use a separate event to only notify of selected accounts instead of changing the
   * underlying bound account list to maintain the list box in the DOM/UI.
   * @param accounts {IAccount} Accounts selected by end-user
   */
  changed(accounts: Accounts) {
    this.value = accounts;
    this.onChange(this.value);
    this.onTouched();
  }
}
