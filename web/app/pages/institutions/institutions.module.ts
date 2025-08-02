import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule,
  ],
  exports: [
    InstitutionFormComponent,
    InstitutionsComponent,
  ]
})
export class InstitutionsModule { }
