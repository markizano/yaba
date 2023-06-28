import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TrashComponent,
  AddComponent,
  CloseComponent,
  EditComponent,
  SaveComponent,
  ActionsComponent,
  SettingsComponent,
  QuestionComponent,
  InspectComponent,
} from 'app/controls/controls.component';

const components = [
  ActionsComponent,
  AddComponent,
  CloseComponent,
  EditComponent,
  InspectComponent,
  QuestionComponent,
  SaveComponent,
  SettingsComponent,
  TrashComponent,
];

@NgModule({
  declarations: components,
  imports: [ CommonModule ],
  providers: [ ],
  exports: components,
})
export class ControlsModule { }
