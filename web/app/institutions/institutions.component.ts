import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InstitutionFormComponent } from 'app/forms/institution/institution-form.component';
import { IInstitution, Institution } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
import { InstitutionsService } from 'app/storables/institutions.service';

@Component({
  selector: 'yaba-institutions',
  templateUrl: './institutions.component.html',
  styleUrls: ['./institutions.component.css'],
  standalone: true,
  imports: [ CommonModule, InstitutionFormComponent ],
  providers: [ InstitutionsService ],
})
export class InstitutionsComponent {
  public form: InstitutionFormComponent;

  constructor( private institutions: InstitutionsService ) {
    this.institutions = institutions;
    this.form = new InstitutionFormComponent();
  }

  public add(): void {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
    this.form.visible = true;
    this.form.mode = FormMode.Create;
  }

  public remove(institutuion: IInstitution): void {
    this.institutions.remove(institutuion);
  }

  public save(event: Event): void {
    // this.session.save();
    console.log('saving institutions.');
    let i;
    switch(this.form.mode) {
      case FormMode.Create:
        i = new Institution();
        Object.assign(i, event.target)
        this.institutions.add(i);
        break;
      case FormMode.Edit:
        console.log(`Editing institution: ${event.target}`);
        break;
      default:
        throw new Error(`Unknown form mode: ${this.form.mode}`);
    }
  }

  public edit(institution: IInstitution): void {
    this.form.visible = true;
    this.form.mode = FormMode.Edit;
    this.form.institution = institution;
  }
}
