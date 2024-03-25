import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
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
} from 'app/controls/icons.component';
import {
  YabaTxnPaginationComponent,
  TransactionFilterComponent,
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
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    YabaTxnPaginationComponent,
    TransactionFilterComponent,
  ],
  providers: [ ],
  exports: [...components, TransactionFilterComponent],
})
export class ControlsModule { }
