import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { AccountTypes, Account, InterestStrategy } from 'app/lib/accounts';
import { Institution, Institutions } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
import { NgSelectable } from 'app/lib/types';
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

    institutions: Institutions;
    institutionIds: NgSelectable<Institution>[] = [];
    accountTypes: NgSelectable<AccountTypes>[] = [];
    interestStrategies: NgSelectable<InterestStrategy>[] = [];

    // User feedback.
    errors: string[] = [];

    constructor(protected institutionsService: InstitutionsService, protected chgRef: ChangeDetectorRef) {
        console.log('new AccountFormComponent()');
        this.account = new Account();
        this.institutions = new Institutions();
        this.reset();
    }

    ngOnInit(): void {
        console.log('AccountFormComponent().ngOnInit()');
        this.accountTypes = this.getAccountTypes();
        this.interestStrategies = this.getInterestStrategies();
        this.institutionsService.load().then(
            (institutions: Institutions) => {
                this.institutions.add(...institutions);
                this.institutionIds = institutions.map((x: Institution) => ({ label: x.name, value: x }));
                this.chgRef.detectChanges();
                console.log('AccountFormComponent().ngOnInit().institutions: ', institutions);
            },
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
            this.errors.add('Name is required.');
        }
        if (this.account.name.length > 64) {
            this.errors.add('Name must be less than 64 characters.');
        }
        if (this.account.description.length > 256) {
            this.errors.add('Description must be less than 256 characters.');
        }
        if (!this.account.institutionId) {
            this.errors.add('Account must be associated with institution.');
        }
        if (!this.account.accountType) {
            this.errors.add('What kind of account is this?');
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
