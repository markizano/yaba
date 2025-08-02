import { NgModule } from '@angular/core';

import { InstitutionsComponent } from 'app/pages/institutions/institutions';
import { InstitutionFormComponent } from 'app/forms/institution/institution-form';
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
