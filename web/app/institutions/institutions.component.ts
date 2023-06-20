import { CommonModule } from '@angular/common';
import { Component, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { InstitutionFormComponent } from 'app/forms/institution/institution-form.component';
import { IInstitution, Institutions, Institution } from 'app/lib/institutions';

@Component({
  selector: 'yaba-institutions',
  templateUrl: './institutions.component.html',
  styleUrls: ['./institutions.component.css'],
  standalone: true,
  schemas: [ NO_ERRORS_SCHEMA ],
  imports: [ CommonModule, InstitutionFormComponent ]
})
export class InstitutionsComponent {
  @Input() institutions: Institutions;
  @Output() institution: IInstitution;
  mode = 'add';
  error?: string;

  constructor() {
    this.institutions = new Institutions();
    this.institution = new Institution();
  }

  public add() {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
    this.institutions.push(this.institution);
  }

  public remove(institutuion: IInstitution) {
    this.institutions.remove(institutuion);
  }

  public save() {
    // this.session.save();
  }

  public edit(institution: IInstitution) {
    this.mode = 'edit';
    this.institution = institution;
  }
}
