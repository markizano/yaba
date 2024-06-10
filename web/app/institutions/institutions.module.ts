import { NgModule } from '@angular/core';

import { InstitutionsComponent } from 'app/institutions/institutions.component';
import { InstitutionFormComponent } from 'app/forms/institution/institution-form.component';
import { ControlsModule } from 'app/controls/controls.module';


@NgModule({
  declarations: [
    InstitutionsComponent,
],
imports: [
    ControlsModule,
    InstitutionFormComponent,
  ],
  exports: [
    InstitutionFormComponent,
    InstitutionsComponent,
  ]
})
export class InstitutionsModule { }
