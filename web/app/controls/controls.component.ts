import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'trash',
  template: '<trash></trash>',
  styleUrls: ['./controls.component.css'],
})
export class TrashComponent { }

@Component({
  selector: 'add',
  template: '<add></add>',
  styleUrls: ['./controls.component.css'],
})
export class AddComponent { }

@Component({
  selector: 'close',
  template: '<close></close>',
  styleUrls: ['./controls.component.css'],
})
export class CloseComponent { }

@Component({
    selector: 'mapping',
    template: '<mapping></mapping>',
    styleUrls: ['./controls.component.css'],
})
export class MappingComponent { }

@Component({
    selector: 'edit',
    template: '<edit></edit>',
    styleUrls: ['./controls.component.css'],
})
export class EditComponent { }

@Component({
    selector: 'save',
    template: '<save></save>',
    styleUrls: ['./controls.component.css'],
})
export class SaveComponent { }

@Component({
  selector: 'actions',
  template: '<actions></actions>',
  styleUrls: ['./controls.component.css'],
})
export class ActionsComponent { }    

@Component({
  selector: 'menu',
  template: '<menu></menu>',
  styleUrls: ['./controls.component.css'],
})
export class MenuComponent { }    

@NgModule({
  declarations: [
    TrashComponent,
    AddComponent,
    CloseComponent,
    MappingComponent,
    EditComponent,
    SaveComponent,
    ActionsComponent,
    MenuComponent,
  ],
  imports: [ ],
  providers: [ ],
  exports: [ TrashComponent, AddComponent, CloseComponent, MappingComponent, EditComponent, SaveComponent, ActionsComponent, MenuComponent ],
})
export class ControlsModule { }
