import { Component, EventEmitter, Input, Output } from '@angular/core';
import { YabaAnimations } from 'app/lib/animations';

import { IInstitution, Institution, Institutions } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
// import { InstitutionsService } from 'app/storables/institutions.service';

@Component({
        selector: 'yaba-institutions',
        templateUrl: './institutions.component.html',
        styleUrls: ['./institutions.component.css'],
        // providers: [ InstitutionsService ],
        animations: [
            YabaAnimations.fade()
        ]
})
export class InstitutionsComponent {
    @Input() institutions: Institutions;
    @Output() institutionsChange = new EventEmitter<Institutions>();

    institution: IInstitution;

    // Form controls
    formVisible = false;
    formMode: FormMode = FormMode.Create;

    // User feedback
    errors: string[] = [];
    
    // @NOTE: Provider/services also assign the property to this object as defined by the name in the constructor.
    constructor( ) {
        this.institutions = new Institutions();
        this.institution = new Institution();
    }

    // user-clickable add button
    add(): void {
        this.institution = new Institution();
        this.formMode = FormMode.Create;
        this.formVisible = true;
    }

    remove(institutuion: IInstitution): void {
        this.institutions.remove(institutuion);
    }

    // User clicked save button.
    save(institution: IInstitution): void {
        this.institutions.push(institution);
        this.institutionsChange.emit(this.institutions);
        this.close()
    }

    // User wants to edit an institution.
    edit(institution: IInstitution): void {
        this.institution = institution;
        this.formMode = FormMode.Edit;
        this.formVisible = true;
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
    }
}
