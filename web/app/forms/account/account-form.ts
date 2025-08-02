import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Account } from 'app/lib/accounts';
import { Institutions } from 'app/lib/institutions';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaAnimations } from 'app/lib/animations';
import { InstitutionsService } from 'app/services/institutions.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'yaba-account-form',
    templateUrl: './account-form.html',
    styleUrls: ['./account-form.css'],
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
    accountTypes = Account.Types();

    // User feedback.
    errors: string[] = [];

    #cachedUpdates?: Subscription;

    constructor(protected institutionsService: InstitutionsService) { }

    ngOnInit(): void {
        console.log('AccountFormComponent().ngOnInit()');
        const update = (institutions: Institutions) => {
            this.institutions = institutions;
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

    pickInstitution(institutionId: string): void {
        console.log(`AccountFormComponent().pickInstitution(${institutionId})`);
        this.account.institutionId = institutionId;
    }

    saveChanges(): void {
        // Perform form validation to ensure fields are not empty.
        // If they are, display a message to the user.
        if ( !this.validate() ) {
            return;
        }
        console.log('AccountFormComponent.save()', this.account);
        this.accountChange.emit(this.account);
        this.save.emit(this.account);
        this.reset();
    }

    cancelForm(): void {
        this.cancel.emit();
        this.reset();
    }

    reset(): void {
        this.account = new Account();
        this.errors = [];
    }
}
