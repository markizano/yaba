/* Angular Definitions */
import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

/* YABA Definitions */
import { YabaAnimations } from 'app/lib/animations';
import { FormMode } from 'app/lib/structures';
import { IInstitution, Institution, InstitutionMappings, MapTypes } from 'app/lib/institutions';
import { TransactionFields } from 'app/lib/transactions';
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
    @Input() institution: IInstitution;
    @Output() institutionChange: EventEmitter<IInstitution> = new EventEmitter<IInstitution>();

    @Input() mode: FormMode = FormMode.Create;
    @Output() modeChange = new EventEmitter<FormMode>();

    @Output() save = new EventEmitter<IInstitution>();
    @Output() cancel = new EventEmitter<void>();
    @Output() drop = new EventEmitter<Array<File>>();

    errors: string[] = []; // List of array messages to render to end-user.
    fields: {label: string, value: TransactionFields}[] = [];

    // Disable dropping on the body of the document. 
    // This prevents the browser from loading the dropped files
    // using it's default behaviour if the user misses the drop zone.
    // Set this input to false if you want the browser default behaviour.
    preventBodyDrop = true;

    readonly MapTypes = MapTypes;
    readonly TransactionFields = TransactionFields;

    constructor(protected $element: ElementRef) {
        this.institution = new Institution(undefined, '', '', new InstitutionMappings({fromField: '', toField: TransactionFields.UNKNOWN, mapType: MapTypes.csv}));
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
    getTransactionFields() {
        this.fields = Object.keys(TransactionFields)
          .filter((x) => typeof x === 'string' && !this.institution.mappings.hasToField(x as TransactionFields))
          .map((key: string) => ({ label: key, value: TransactionFields[key as keyof typeof TransactionFields] as TransactionFields }));
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

    edit(institution: IInstitution): void {
        this.institutionChange.emit( this.institution = institution );
        this.modeChange.emit( this.mode = FormMode.Edit );
    }

    addMapping(): void {
        if ( this.fields.length -1 > this.institution.mappings.length ) {
            this.institution.addMapping('', TransactionFields.UNKNOWN, MapTypes.csv);
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
        this.mode = FormMode.Create;
        this.errors = [];
    }

    /**
     * Cancel the form and close it.
     */
    cancelForm() {
        this.cancel.emit();
        this.reset();
    }
}
