import { Component, EventEmitter, Output } from '@angular/core';

import { IInstitution, Institution, Institutions } from 'app/lib/institutions';
import { InstitutionsService } from 'app/storables/institutions.service';

@Component({
    selector: 'yaba-institutions',
    templateUrl: './institutions.component.html',
    styleUrls: ['./institutions.component.css'],
    providers: [ InstitutionsService ],
})
export class InstitutionsComponent {
  collection: Institutions;
  institution: IInstitution;
  @Output() institutionChange = new EventEmitter<IInstitution>();
  errors?: string[];
  showForm: boolean;

  // @NOTE: Provider/services also assign the property to this object as defined by the name in the constructor.
  constructor( protected institutions: InstitutionsService ) {
    this.collection = institutions.getInstitutions();
    this.institution = new Institution();
    this.errors = [];
    this.showForm = false;
  }

  public add(): void {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
    console.log('adding institution, set seeForm = true');
    this.showForm = true;
  }

  public remove(institutuion: IInstitution): void {
    this.collection.remove(institutuion);
  }

  public save(): void {
    // this.session.save();
    console.log('saving institutions.');
    this.institutions.save();
  }

  public edit(institution: IInstitution): void {
    // edits a form.
    this.showForm = true;
    this.institution = institution;
  }

  public cancel(): void {
    // User clicked cancel button.
    this.showForm = false;
    this.institution = new Institution();
  }
}
