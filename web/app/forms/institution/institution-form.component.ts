import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { ControlsModule } from 'app/controls/controls.component';
import { FormMode } from 'app/lib/structures';
import { IInstitution, Institution, MapTypes, IMapping } from 'app/lib/institutions';
import { TransactionFields } from 'app/lib/transactions';

@Component({
  selector: 'yaba-institution-form',
  templateUrl: './institution-form.component.html',
  styleUrls: ['./institution-form.component.css'],
  imports: [ CommonModule, ControlsModule ],
  standalone: true,
})
export class InstitutionFormComponent {
  @Input() institution?: IInstitution;
  @Output() newInstitution: EventEmitter<IInstitution> = new EventEmitter<IInstitution>();
  public visible?: boolean;
  public mode: FormMode = FormMode.Create;
  public errors: string[] = []; // List of array messages to render to end-user.
  public readonly MapTypes = MapTypes;
  public readonly TransactionFields = TransactionFields;
  public forms?: FormGroup;

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
  }

  /**
   * Validates the form to ensure we have a named institution with a reasonable description.
   * @returns boolean
   */
  public validate(): boolean {
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
   * Handles the click event to save the institution to the database.
   * Performs additional validation and checks to make sure all fields are entered accordingly.
   * Renders errors for the user until validation passes, then send the information to the database.
   */
  public save(): void {
    if ( ! this.validate() ) return;
    this.newInstitution.emit(this.institution);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public cancel(event?: Event): void {
    this.close();
    this.reset();
  }

  public edit(institution: IInstitution): void {
    this.mode = FormMode.Edit;
    this.institution = institution;
  }

  public addMapping(): void {
    if ( ! this.institution ) return;
    this.institution.addMapping('', TransactionFields.UNKNOWN, MapTypes.static);
  }

  /**
   * Remove a mapping from the list of mappings.
   */
  public removeMapping(mapping: IMapping): void {
    this.institution?.mappings.removeMapping(mapping);
  }

  /**
   * Close out the form and hide from view.
   */
  protected close() {
    this.visible = false;
  }

  /**
   * Reset the form to its initial state behind the scenes.
   */
  protected reset() {
    this.institution = new Institution();
    this.mode = FormMode.Create;
    this.errors = [];
  }
}
