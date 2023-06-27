import { Component } from '@angular/core';

import { IInstitution, Institution, Institutions } from 'app/lib/institutions';
import { InstitutionsService } from 'app/storables/institutions.service';

@Component({
    selector: 'yaba-institutions',
    templateUrl: './institutions.component.html',
    styleUrls: ['./institutions.component.css'],
    providers: [ InstitutionsService ],
})
export class InstitutionsComponent {
  public collection: Institutions;
  protected institution: IInstitution;
  public errors?: string[];
  protected seeForm: boolean;

  // @NOTE: Provider/services also assign the property to this object as defined by the name in the constructor.
  constructor( protected institutions: InstitutionsService ) {
    this.collection = institutions.getInstitutions();
    this.institution = new Institution();
    this.errors = [];
    this.seeForm = false;
  }

  public add(): void {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
    this.seeForm = true;
    console.log('adding institution, set seeForm = true');
  }

  public remove(institutuion: IInstitution): void {
    this.collection.remove(institutuion);
  }

  public save(event: Event): void {
    // this.session.save();
    console.log('saving institutions.');
  }

  public edit(institution: IInstitution): void {
    // edits a form.
  }

  public cancel(event?: Event): void {
    // User clicked cancel button.
    this.seeForm = false;
  }
}
