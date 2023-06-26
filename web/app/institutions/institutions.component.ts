import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InstitutionFormComponent } from 'app/forms/institution/institution-form.component';
import { IInstitution, Institution } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
import { InstitutionsService } from 'app/storables/institutions.service';
import { ControlsModule } from "app/controls/controls.component";

@Component({
  selector: 'institution-list',
  template: '<institution-list></institution-list>',
  styleUrls: ['./institutions.component.css'],
  standalone: true,
  imports: [ CommonModule ]
})
export class InstitutionListComponent { }

@Component({
  selector: 'institution',
  template: '<institution></institution>',
  styleUrls: ['./institutions.component.css'],
  standalone: true,
})
export class InstitutionComponent { }

export const localComponents = [ InstitutionListComponent, InstitutionComponent ];

@Component({
    selector: 'yaba-institutions',
    templateUrl: './institutions.component.html',
    styleUrls: ['./institutions.component.css'],
    standalone: true,
    providers: [InstitutionsService],
    imports: [CommonModule, InstitutionFormComponent, ControlsModule, ...localComponents]
})
export class InstitutionsComponent {
  protected institution: IInstitution;
  public form: InstitutionFormComponent;

  constructor( protected institutions: InstitutionsService ) {
    this.institutions = institutions;
    this.institution = new Institution();
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

  public cancel(event?: Event): void {
    this.form.cancel(event);
  }
}
