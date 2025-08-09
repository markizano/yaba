import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, inject, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";

import { Account, Accounts } from "app/lib/accounts";
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
    standalone: false,
    templateUrl: './account-selector.html',
    styleUrls: ['./account-selector.css'],
    providers: [{ // Enables the use of [(ngModel)] to be passed to this component.
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AccountSelectorComponent),
        multi: true
    }]
})
export class AccountSelectorComponent implements ControlValueAccessor, AfterViewInit {
  chDet: ChangeDetectorRef = inject(ChangeDetectorRef);
  @Input() value: Account[] = [];
  @Output() selectedAccounts = new EventEmitter<Accounts>();
  #accts?: Subscription;

  // ControlValueAccessor implementation
  // Outputs a string=accountId
  onChange = (_: Account[]) => {};
  onTouched = () => {};
  disabled: boolean = false;

  multiple: boolean = false;
  required: boolean = false;

  accounts = new Accounts();
  accountsService: AccountsService = inject(AccountsService);
  ref: ElementRef = inject(ElementRef);


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
    this.multiple = this.ref.nativeElement.classList.contains('multiple');
    this.required = this.ref.nativeElement.hasAttribute('required');
    this.chDet.detectChanges();
  }

  /* BEGIN: [(ngModel)] handler methods */
  writeValue(value: Account[]): void {
      this.value = value || [];
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
  changed(accounts: Account[]) {
    this.value = accounts || [];
    this.onChange(this.value);
    this.onTouched();
    this.selectedAccounts.emit(new Accounts(...accounts));
  }
}
