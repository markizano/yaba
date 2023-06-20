import { Component, Input, Output } from '@angular/core';
import { IInstitution, Institutions, Institution } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapTypes } from 'app/lib/institutions';
import { TransactionFields } from 'app/lib/transactions';

@Component({
  selector: 'yaba-institution-form',
  templateUrl: './institution-form.component.html',
  styleUrls: ['./institution-form.component.css'],
  imports: [ CommonModule ],
  standalone: true,
  schemas: [ NO_ERRORS_SCHEMA ],
})
export class InstitutionFormComponent {
  @Input() institutions: Institutions = new Institutions();
  @Output() institution: IInstitution = new Institution();
  visible?: boolean;
  mode: FormMode = FormMode.Create;
  public readonly MapTypes = MapTypes;

  public save() {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
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
