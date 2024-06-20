
import { Component, Directive, HostListener, Injectable, Input } from '@angular/core';

@Injectable()
abstract class IconBaseComponent {
  /**
   * Make it possible to use [Space] or [Enter] on these components to trigger a "click" event so we only have to listen for the click event.
   * @param $event 
   */
    @HostListener('keypress')
    onKeyPress($event: KeyboardEvent) {
      if ( ['Enter', ' '].includes($event.key) ) {
        $event.target?.dispatchEvent(new MouseEvent('click'));
      } else {
        $event.preventDefault();
        $event.stopPropagation();
      }
    }
}

@Directive({
  selector: 'actions',
})
export class ActionsComponent { }

@Component({
  selector: 'add',
  template: '',
})
export class AddComponent extends IconBaseComponent { }

@Component({
  selector: 'close',
  template: '',
})
export class CloseComponent extends IconBaseComponent { }

@Component({
  selector: 'debug',
  template: '',
})
export class DebugComponent { }

@Component({
  selector: 'edit',
  template: '',
})
export class EditComponent extends IconBaseComponent { }

@Component({
  selector: 'inspect',
  template: '',
})
export class InspectComponent extends IconBaseComponent { }

@Component({
  selector: 'question',
  template: '',
})
export class QuestionComponent { }

@Component({
  selector: 'save',
  template: '',
})
export class SaveComponent extends IconBaseComponent { }

@Component({
  selector: 'trash',
  template: '',
})
export class TrashComponent extends IconBaseComponent { }

@Component({
  selector: 'settings',
  template: '',
})
export class SettingsComponent extends IconBaseComponent { }

@Component({
    selector: 'errors',
    template: '<div class="errors">@for(error of errors; track error) { <p>{{ error }} </p> }</div>',
})
export class ErrorsDisplayComponent {
    @Input() errors: string[] = [];
}
  
