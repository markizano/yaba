import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { IInstitution, Institution, Institutions } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
import { InstitutionsService } from 'app/services/institutions.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'yaba-institutions',
    templateUrl: './institutions.component.html',
})
export class InstitutionsComponent {
    @Input() institutions: Institutions;
    @Output() institutionsChange = new EventEmitter<Institutions>();

    institution: IInstitution;

    // Form controls
    formVisible = false;
    formMode: FormMode = FormMode.Create;
    #isub: Subscription;

    // @NOTE: Provider/services also assign the property to this object as defined by the name in the constructor.
    constructor( protected institutionsService: InstitutionsService, protected changeDet: ChangeDetectorRef ) {
        this.institutions = new Institutions();
        this.institution = new Institution();
        this.#isub = this.institutionsChange.subscribe((institutions: Institutions) => {
            this.institutionsService.save(institutions);
        });
    }

    ngOnInit(): void {
        this.institutionsService.load().then(institutions => {
            console.log('Institutions loaded: ', institutions);
            this.institutions.push(...institutions);
            this.changeDet.detectChanges();
        }, error => {
            console.error('Error loading institutions: ', error);
        });
    }

    ngOnDestroy(): void {
        this.#isub.unsubscribe();
    }

    // user-clickable add button
    add(): void {
        this.institution = new Institution();
        this.formMode = FormMode.Create;
        this.formVisible = true;
    }

    remove($index: number, institutuion: IInstitution): void {
        this.institutions.splice($index, 1);
        this.institutionsChange.emit(this.institutions);
        console.log('Removed institution: ', institutuion);
    }

    // User clicked save button.
    save(institution: IInstitution): void {
        if ( this.formMode === FormMode.Create ) {
            this.institutions.push(institution);
        }
        this.institutionsChange.emit(this.institutions);
        this.close()
    }

    // User wants to edit an institution.
    edit($index: number, institution: IInstitution): void {
        this.institution = institution;
        this.formMode = FormMode.Edit;
        this.formVisible = true;
        console.log('Editing institution: ', institution);
    }

    // User dropped a file on the form.
    parseCSVFiles($event: File[]): void {
        Institutions.csvHandler($event).then(mappings => {
            this.institution.mappings = mappings;
            this.institutionsChange.emit(this.institutions);
        });
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
