/* Angular Definitions */
import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

/* YABA Definitions */
import { YabaAnimations } from 'app/lib/animations';
import { NgSelectable } from 'app/lib/types';
import { Institution, InstitutionMapping, InstitutionMappings, Institutions, MapTypes } from 'app/lib/institutions';
import { ITransaction, Transaction } from 'app/lib/transactions';
import { ControlsModule } from 'app/controls/controls.module';

/* SubComponents */
import { InstitutionMappingComponent } from 'app/forms/institution/institution-mapping.component';

@Component({
    selector: 'yaba-institution-form',
    templateUrl: './institution-form.component.html',
    animations: [
        YabaAnimations.fadeSlideDown()
    ],
    standalone: true,
    imports: [
        ControlsModule,
        InstitutionMappingComponent,
    ],
})
export class InstitutionFormComponent {
    @Input() institution = new Institution();
    @Output() institutionChange = new EventEmitter<Institution>();

    @Output() save = new EventEmitter<Institution>();
    @Output() cancel = new EventEmitter<void>();

    errors: string[] = []; // List of array messages to render to end-user.
    fields: NgSelectable<keyof ITransaction>[] = [];

    // Disable dropping on the body of the document. 
    // This prevents the browser from loading the dropped files
    // using it's default behaviour if the user misses the drop zone.
    // Set this input to false if you want the browser default behaviour.
    preventBodyDrop = true;

    constructor(protected $element: ElementRef) { }

    ngOnInit() {
        this.getTransactionFields();
    }

    /**
     * Validates the form to ensure we have a named institution with a reasonable description.
     * @returns boolean
     */
    validate(): boolean {
        this.errors = [];
        if ( ! this.institution ) {
            this.errors.push('Institution is not set? This is a bug, please report it to the developers at support@markizano.net');
            return false;
        }
        if ( ! this.institution.name ) {
            this.errors.push('Name is required.');
        }
        if ( this.institution.name.length > 255 ) {
            this.errors.push('Name must be less than 255 characters.');
        }
        if ( this.institution.description.length > 255 ) {
            this.errors.push('Description must be less than 255 characters.');
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
            this.cancelForm();
        }
        // If Ctrl+Enter is pressed, submit the form.
        if ( $event.ctrlKey && $event.key === 'Enter' ) {
            this.saveChanges();
        }
    }

    /**
     * Get the list of transaction field types from the enum into a list of pairs for the name:value.
     */
    getTransactionFields(): NgSelectable<keyof Transaction>[] {
        this.fields = Object.keys(new Transaction())
          .filter((x) => typeof x === 'string' && !this.institution.mappings.hasToField(x as keyof ITransaction))
          .map((key: string) => ({ label: key, value: key as keyof ITransaction }));
          return this.fields;
    }

    /**
     * Handles the click event to save the institution to the database.
     * Performs additional validation and checks to make sure all fields are entered accordingly.
     * Renders errors for the user until validation passes, then send the information to the database.
     */
    saveChanges(): void {
        if ( ! this.validate() ) return;
        this.institutionChange.emit(this.institution);
        this.save.emit(this.institution);
        this.reset();
    }

    /**
     * Add a mapping to the list of mappings.
     * Trigger target events to notify the parent component of the changes.
     */
    addMapping(): void {
        if ( this.fields.length -1 > this.institution.mappings.length ) {
            this.institution.addMapping('', 'description', MapTypes.value);
            this.institutionChange.emit(this.institution);
        }
        this.getTransactionFields();
    }

    /**
     * Remove a mapping from the list of mappings.
     */
    removeMapping(i: number): void {
        const removed = this.institution.mappings.splice(i, 1);
        console.log(`InstitutionFormComponent().removeMapping(): Removed mapping ${removed} from the list of mappings.`);
        this.institutionChange.emit(this.institution);
    }

    /**
     * Reset the form to its initial state behind the scenes.
     */
    reset() {
        this.institution = new Institution();
        this.errors = [];
    }

    /**
     * Cancel the form and close it.
     */
    cancelForm() {
        this.cancel.emit();
        this.reset();
    }

    // User dropped a file on the form.
    parseCSVFiles($event: File[]): void {
        Institutions.csvHandler($event).then((csvHeaders: string[]) => {
            this.institution.mappings = InstitutionMappings.fromList(csvHeaders.map((m) => InstitutionMapping.fromObject({ fromField: m, mapType: MapTypes.value })));
            this.institutionChange.emit(this.institution);
        });
    }

}
