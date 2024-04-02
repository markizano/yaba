import { Component, EventEmitter, Output } from '@angular/core';

import { IInstitution, Institution, Institutions } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
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
  errors: string[];
  formVisible: boolean;
  formMode: FormMode;

  // @NOTE: Provider/services also assign the property to this object as defined by the name in the constructor.
  constructor( protected institutions: InstitutionsService ) {
    this.collection = institutions.getInstitutions();
    this.institution = new Institution();
    this.errors = [];
    this.formVisible = false;
    this.formMode = FormMode.Create;
  }

  // user-clickable add button
  add(): void {
    this.institution = new Institution();
    this.formMode = FormMode.Create;
    this.formVisible = true;
  }

  remove(institutuion: IInstitution): void {
    this.collection.remove(institutuion);
  }

  save(institution: IInstitution): void {
    this.institution = institution;
    this.institutionChange.emit(institution);
    this.close()
  }

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
