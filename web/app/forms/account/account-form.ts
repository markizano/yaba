import { Subscription } from 'rxjs';

import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';

import { Account } from 'app/lib/accounts';
import { Institutions } from 'app/lib/institutions';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaAnimations } from 'app/lib/animations';
import { InstitutionsService } from 'app/services/institutions.service';

@Component({
    selector: 'yaba-account-form',
    templateUrl: './account-form.html',
    styleUrls: ['./account-form.css'],
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

    @Output() saveAccount = new EventEmitter<Account>();
    @Output() cancelAccount = new EventEmitter<void>();

    institutions = new Institutions();

    // User feedback.
    errors: string[] = [];

    #cachedUpdates?: Subscription;

    institutionsService = inject(InstitutionsService);

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

    /**
     * Checks to see if ESC was pressed in this key event.
     * If so, we cancel and close the form.
     */
    @HostListener('document:keydown', ['$event'])
    escKey($event: KeyboardEvent): void {
        if ( $event.key === 'Escape' ) {
            this.doCancelForm();
        }
        // If Ctrl+Enter is pressed, submit the form.
        if ( $event.ctrlKey && $event.key === 'Enter' ) {
            this.saveChanges();
        }
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
        this.saveAccount.emit(this.account);
        this.reset();
    }

    doCancelForm(): void {
        this.cancelAccount.emit();
        this.reset();
    }

    reset(): void {
        this.account = new Account();
        this.errors = [];
    }
}
