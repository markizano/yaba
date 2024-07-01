import { Component } from '@angular/core';

import { Institution, Institutions } from 'app/lib/institutions';
import { InstitutionsService } from 'app/services/institutions.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'yaba-institutions',
    templateUrl: './institutions.component.html',
})
export class InstitutionsComponent {
    // Local storage of the institutions list in this component.
    institutions = new Institutions();

    // Local institution to pass to the form.
    institution = new Institution();

    // Form controls
    formVisible = false;

    // Save the index for edits later.
    #index?: number;

    // Subscription to the institutions service.
    #institutionUpdates?: Subscription;

    // @NOTE: Provider/services also assign the property to this object as defined by the name in the constructor.
    constructor( protected institutionsService: InstitutionsService ) { }

    ngOnInit() {
        const update = (institutions: Institutions) => {
            this.institutions = institutions;
        };
        update(this.institutionsService.get());
        this.#institutionUpdates = this.institutionsService.subscribe(update);

    }

    ngOnDestroy(): void {
        this.#institutionUpdates?.unsubscribe();
    }

    /**
     * Adds a new institution to the list of institutions.
     */
    add(): void {
        this.institution = new Institution();
        this.formVisible = true;
    }

    remove($index: number, institutuion: Institution): void {
        const removed = this.institutions.splice($index, 1);
        if ( removed[0] == institutuion) {
            console.log('Removed institution: ', institutuion);
            this.institutionsService.save(this.institutions);
        }
    }

    // User clicked save button.
    save(institution: Institution): void {
        if ( this.#index !== undefined ) {
            this.institutions[this.#index] = institution;
        } else {
            this.institutions.push(institution);
        }
        this.institutionsService.save(this.institutions);
        this.close();
        this.reset();
    }

    // User wants to edit an institution.
    edit($index: number, institution: Institution): void {
        this.institution = institution;
        this.formVisible = true;
        this.#index = $index;
        console.log('Editing institution: ', institution);
    }

    // User clicked cancel button.
    cancel(): void {
        this.close();
        this.reset();
    }

    close(): void {
        this.formVisible = false;
    }

    reset(): void {
        this.institution = new Institution();
        this.#index = undefined;
    }
}
