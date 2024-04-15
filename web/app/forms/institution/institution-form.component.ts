import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { YabaAnimations } from 'app/lib/animations';
import { FormMode } from 'app/lib/structures';
import { IInstitution, Institution, MapTypes, IMapping } from 'app/lib/institutions';
import { TransactionFields } from 'app/lib/transactions';
import { ControlsModule } from 'app/controls/controls.module';

@Component({
  selector: 'yaba-institution-form',
  templateUrl: './institution-form.component.html',
  styleUrls: ['./institution-form.component.css'],
  animations: [
    YabaAnimations.fadeSlideDown()
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ControlsModule,
  ],
})
export class InstitutionFormComponent {
  @Input() institution: IInstitution;
  @Output() institutionChange: EventEmitter<IInstitution> = new EventEmitter<IInstitution>();

  @Input() mode: FormMode = FormMode.Create;
  @Output() modeChange = new EventEmitter<FormMode>();

  @Output() save = new EventEmitter<IInstitution>();
  @Output() cancel = new EventEmitter<void>();

  errors: string[] = []; // List of array messages to render to end-user.
  forms: FormGroup; // Form group for the institution form.
  maps: boolean[]; // List of boolean values for rendering to end-user.

  readonly MapTypes = MapTypes;
  readonly TransactionFields = TransactionFields;

  constructor() {
    this.institution = new Institution();
    this.forms = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      mappings: new FormArray([
        new FormGroup({
          fromField: new FormControl('', Validators.required),
          toField: new FormControl(TransactionFields.UNKNOWN, Validators.required),
          mapType: new FormControl(MapTypes.static, Validators.required),
        }),
      ]),
    });
    this.maps = [];
  }

  /**
   * Validates the form to ensure we have a named institution with a reasonable description.
   * @returns boolean
   */
  validate(): boolean {
    this.errors = [];
    if ( ! this.institution ) return false;
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
   * Get the list of transaction field types from the enum into a list of pairs for the name:value.
   */
  getTransactionFields() {
    return Object.keys(TransactionFields).filter(x => typeof x === 'string').map((key: string) => ({ name: key, value: TransactionFields[key as keyof typeof TransactionFields] }));
  }

  /**
   * Checks to see if ESC was pressed in this key event.
   * If so, we cancel and close the form.
   */
  keyEvent($event: KeyboardEvent): void {
    if ( $event.key === 'Escape' ) {
      this.cancelForm();
    }
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
    if ( ! this.institution ) return;
    let visible = false;
    this.maps.push(visible);
    this.institution.addMapping('', TransactionFields.UNKNOWN, MapTypes.static);
    this.institutionChange.emit(this.institution);
    setTimeout(() => {
      visible = true;
    }, 10);
  }

  /**
   * Remove a mapping from the list of mappings.
   */
  removeMapping(mapping: IMapping): void {
    this.maps[this.maps.length - 1] = false;
    setTimeout(() => {
      this.institution.mappings.removeMapping(mapping);
      this.institutionChange.emit(this.institution);
      this.maps.splice(this.institution.mappings.indexOf(mapping), 1);
    }, YabaAnimations.ANIMATE_MS);
  }

  /**
   * Reset the form to its initial state behind the scenes.
   */
  reset() {
    this.institution = new Institution();
    this.mode = FormMode.Create;
    this.errors = [];
    this.institutionChange.emit(this.institution);
    this.modeChange.emit(this.mode);
  }

  /**
   * Cancel the form and close it.
   */
  cancelForm() {
    this.cancel.emit();
    this.reset();
  }
}
