import { Component } from '@angular/core';

import { Institution, Institutions } from 'app/lib/institutions';
import { InstitutionsService } from 'app/services/institutions.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'yaba-institutions',
    templateUrl: './institutions.component.html',
    standalone: false,
})
export class InstitutionsComponent {
    // Local storage of the institutions list in this component.
    institutions = new Institutions();

    // Local institution to pass to the form.
    institution = new Institution();

    // Form controls
    formVisible = false;

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
        this.formVisible = true;
    }

    /**
     * User wants to edit an institution.
     */
    edit(institution: Institution): void {
        this.institution.update(institution);
        this.formVisible = true;
        console.log('Editing institution: ', institution);
    }

    remove(institutuion: Institution): void {
        console.log(`InsitituionsComponent().remove(${institutuion.id})`);
        this.institutions.remove(institutuion);
        this.institutionsService.save(this.institutions);
    }

    /**
     * User clicked save button.
     */
    save(institution: Institution): void {
        const oldInstitution = this.institutions.byId(institution.id);
        if ( oldInstitution ) {
            oldInstitution.update(institution);
        } else {
            this.institutions.add(institution);
        }
        this.institutionsService.save(this.institutions);
        this.close();
        this.reset();
    }

    /**
     * User clicked cancel button.
     */
    cancel(): void {
        this.close();
        this.reset();
    }

    close(): void {
        this.formVisible = false;
    }

    reset(): void {
        this.institution = new Institution();
    }
}
