import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AccountTypes, Account } from 'app/lib/accounts';
import { Institution, Institutions } from 'app/lib/institutions';
import { NgSelectable } from 'app/lib/types';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaAnimations } from 'app/lib/animations';
import { InstitutionsService } from 'app/services/institutions.service';
import { Subscription } from 'rxjs';

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
    @Input() account = new Account();
    @Output() accountChange = new EventEmitter<Account>();

    @Output() save = new EventEmitter<Account>();
    @Output() cancel = new EventEmitter<void>();

    institutions = new Institutions();
    institutionIds: NgSelectable<Institution>[] = [];
    accountTypes = this.getAccountTypes();

    // User feedback.
    errors: string[] = [];

    #cachedUpdates?: Subscription;

    constructor(protected institutionsService: InstitutionsService) { }

    ngOnInit(): void {
        console.log('AccountFormComponent().ngOnInit()');
        const update = (institutions: Institutions) => {
            this.institutions = institutions;
            this.institutionIds = institutions.map((x: Institution) => ({ label: x.name, value: x }));
            console.log('AccountFormComponent().ngOnInit().institutionIds: ', this.institutionIds);
        }
        update(this.institutionsService.get());
        this.#cachedUpdates = this.institutionsService.subscribe(update);
        this.reset();
    }

    ngOnDestroy(): void {
        console.log('AccountFormComponent().ngOnDestroy()');
        this.#cachedUpdates?.unsubscribe();
        this.reset();
    }

    getAccountTypes(): NgSelectable<AccountTypes>[] {
        return Object.keys(AccountTypes).filter((x) => typeof x === 'string').map((y) => ({ label: y, value: AccountTypes[y as keyof typeof AccountTypes] }));
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

    pickInstitution(institutionId: string|string[]): void {
        this.account.institutionId = <string>institutionId;
    }

    saveChanges(): void {
        // Perform form validation to ensure fields are not empty.
        // If they are, display a message to the user.
        if ( !this.validate() ) {
            return;
        }
        this.accountChange.emit(this.account);
        this.save.emit(this.account);
        this.cancelForm()
    }

    cancelForm(): void {
        this.cancel.emit();
        this.reset();
    }

    reset(): void {
        this.account = new Account();
    }
}
