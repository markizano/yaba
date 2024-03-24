import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TrashComponent,
  AddComponent,
  CloseComponent,
  DebugComponent,
  EditComponent,
  SaveComponent,
  ActionsComponent,
  SettingsComponent,
  QuestionComponent,
  InspectComponent,
  PaginationComponent,
} from 'app/controls/controls.component';

const components = [
  ActionsComponent,
  AddComponent,
  CloseComponent,
  DebugComponent,
  EditComponent,
  InspectComponent,
  QuestionComponent,
  SaveComponent,
  SettingsComponent,
  TrashComponent,
  PaginationComponent
];

@NgModule({
  declarations: components,
  imports: [ CommonModule ],
  providers: [ ],
  exports: components,
})
export class ControlsModule { }
