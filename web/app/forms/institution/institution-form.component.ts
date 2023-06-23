import { Component, Input, Output, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { FormMode } from 'app/lib/structures';
import { IInstitution, Institutions, Institution, MapTypes } from 'app/lib/institutions';
import { TransactionFields } from 'app/lib/transactions';

@Component({
  selector: 'yaba-institution-form',
  templateUrl: './institution-form.component.html',
  styleUrls: ['./institution-form.component.css'],
  imports: [ CommonModule ],
  standalone: true,
  schemas: [ NO_ERRORS_SCHEMA ],
  exportAs: 'institutionForm',
})
export class InstitutionFormComponent {
  @Input() institutions: Institutions = new Institutions();
  @Output() institution: IInstitution = new Institution();
  public visible?: boolean;
  public mode: FormMode = FormMode.Create;
  public errors: string[] = []; // List of array messages to render to end-user.
  public readonly MapTypes = MapTypes;
  public forms: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    mappings: new FormArray([
      new FormGroup({
        fromField: new FormControl('', Validators.required),
        toField: new FormControl(TransactionFields.UNKNOWN, Validators.required),
        mapType: new FormControl(MapTypes.static, Validators.required),
      }),
    ]),
  });

  /**
   * Handles the click event to save the institution to the database.
   * Performs additional validation and checks to make sure all fields are entered accordingly.
   * Renders errors for the user until validation passes, then send the information to the database.
   */
  public save() {
    this.institution.name = this.institution.name.trim();
    if ( this.institution.name.length > 255 ) {
      this.errors.push('Name must be less than 255 characters.');
    }
    this.institutions.push(this.institution);
  }

  public cancel() {
    this.close();
    this.reset();
  }

  public edit(institution: IInstitution) {
    this.mode = FormMode.Edit;
    this.institution = institution;
  }

  public addMapping() {
    this.institution.addMapping('', TransactionFields.UNKNOWN, MapTypes.static);
  }

  /**
   * Remove a mapping from the list of mappings.
   */
  public remove(institution: IInstitution) {
    this.institutions.remove(institution);
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
  }
}
