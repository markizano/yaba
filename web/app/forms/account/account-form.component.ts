import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AccountTypes, Account, InterestStrategy } from 'app/lib/accounts';
import { Institutions } from 'app/lib/institutions';
import { FormMode, NgSelectable } from 'app/lib/structures';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaAnimations } from 'app/lib/animations';
import { InstitutionsService } from 'app/services/institutions.service';

@Component({
  selector: 'yaba-account-form',
  templateUrl: './account-form.component.html',
  standalone: true,
  imports: [
    ControlsModule,
  ],
  animations: [
    YabaAnimations.fadeSlideDown(),
  ]
})
export class AccountFormComponent {
    @Input() account: Account;
    @Output() accountChange = new EventEmitter<Account>();

    @Input() formMode: FormMode = FormMode.Create;
    @Output() formModeChange = new EventEmitter<FormMode>();

    @Output() save = new EventEmitter<Account>();
    @Output() close = new EventEmitter<void>();

    institutions: Institutions = new Institutions();
    accountTypes: NgSelectable<AccountTypes>[] = [];
    interestStrategies: NgSelectable<InterestStrategy>[] = [];

    // User feedback.
    errors: string[] = [];

    constructor(protected institutionsService: InstitutionsService) {
        console.log('new AccountFormComponent()');
        this.account = new Account();
        this.reset();
    }

    ngOnInit(): void {
        console.log('AccountFormComponent().ngOnInit()');
        this.accountTypes = this.getAccountTypes();
        this.interestStrategies = this.getInterestStrategies();
        this.institutionsService.load().then(
            (institutions: Institutions) => this.institutions.push(...institutions),
            (error) => console.error('Error loading institutions: ', error)
        );
    }

    getAccountTypes(): NgSelectable<AccountTypes>[] {
        return Object.keys(AccountTypes).filter((x) => typeof x === 'string').map((y) => ({ label: y, value: AccountTypes[y as keyof typeof AccountTypes] }));
    }

    getInterestStrategies(): NgSelectable<InterestStrategy>[] {
        return Object.keys(InterestStrategy).filter((x) => typeof x === 'string').map((y) => ({ label: y, value: InterestStrategy[y as keyof typeof InterestStrategy] }));
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

    saveChanges(): void {
        // Perform form validation to ensure fields are not empty.
        // If they are, display a message to the user.
        if ( !this.validate() ) {
            return;
        }
        this.accountChange.emit(this.account);
        this.reset()
        this.closeForm()
    }

    cancel(): void {
        this.closeForm();
    }

    closeForm(): void {
        this.reset();
        this.close.emit();
    }

    reset(): void {
        this.formMode = FormMode.Create;
        this.account = new Account();
    }
}
