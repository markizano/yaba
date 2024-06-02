import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AccountTypes, Account } from 'app/lib/accounts';
import { Institutions } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaAnimations } from 'app/lib/animations';

@Component({
  selector: 'yaba-account-form',
  templateUrl: './account-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ControlsModule,
  ],
  animations: [
    YabaAnimations.fade(),
  ]
})
export class AccountFormComponent {
  @Input() account: Account;
  @Input() formMode: FormMode = FormMode.Create;
  @Output() accountChange = new EventEmitter<Account>();
  @Output() save = new EventEmitter<Account>();

  @Output() close = new EventEmitter<void>();
  
  institutions: Institutions = new Institutions();
  AccountTypes = AccountTypes;

  // User feedback.
  errors: string[] = [];

  constructor() {
    this.account = new Account();
    this.reset();
  }

  getAccountTypes() {
    return Object.keys(AccountTypes).filter((type) => typeof type === 'string').map((type) => ({ label: type, value: AccountTypes[type as keyof typeof AccountTypes] }));
  }

  validate() {
    this.errors = [];
    if (!this.account.name) {
      this.errors.push('Name is required.');
    }
    if (this.account.name.length > 64) {
      this.errors.push('Name must be less than 64 characters.');
    }
    if (this.account.description.length > 256) {
      this.errors.push('Description must be less than 256 characters.');
    }
    if (!this.account.institutionId) {
      this.errors.push('Account must be associated with institution.');
    }
    if (!this.account.accountType) {
      this.errors.push('What kind of account is this?');
    }
    return this.errors.length === 0;
  }

  saveForm(): void {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
    if ( !this.validate() ) {
      return;
    }
    this.accountChange.emit(this.account);
    this.reset()
    this.closeForm()
  }

  cancel() {
    this.closeForm();
  }
  
  closeForm() {
    this.reset();
    this.close.emit();
  }
  
  reset() {
    this.formMode = FormMode.Create;
    this.account = new Account();
  }
}
