
import { Component, Directive, ElementRef, EventEmitter, HostListener, Injectable, Input, Output } from '@angular/core';

/**
 * Most of these directives are here just to make Angular stop complaining about them because I don't want to use NG_CUSTOM_SCHEMA in all my templates.
 * There are a few that have a few extra features and functions that help with aesthetics and functionality.
 */
@Injectable()
export abstract class IconBaseInjectable {
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
export class ActionsDirective { }

@Directive({
  selector: 'add',
})
export class AddDirective extends IconBaseInjectable { }

@Directive({
    selector: 'close, no',
  })
  export class CloseDirective extends IconBaseInjectable { }
  
@Directive({
  selector: 'debug',
})
export class DebugDirective { }

@Directive({
  selector: 'edit',
})
export class EditDirective extends IconBaseInjectable { }

@Directive({
  selector: 'inspect',
})
export class InspectDirective extends IconBaseInjectable { }

@Directive({
  selector: 'question',
})
export class QuestionDirective { }

@Directive({
  selector: 'save',
})
export class SaveDirective extends IconBaseInjectable { }

@Directive({
  selector: 'trash',
})
export class TrashDirective extends IconBaseInjectable { }

@Directive({
  selector: 'settings',
})
export class SettingsDirective extends IconBaseInjectable { }

@Directive({
  selector: 'yes',
})
export class YesDirective extends IconBaseInjectable { }

@Directive({
    selector: 'upload',
})
export class UploadDirective extends IconBaseInjectable {
    @Output() upload = new EventEmitter<File[]>();
    constructor(protected elemRef: ElementRef) {
        super();
    }
    /**
     * On Click, fabricate an input file element and trigger a click event on it.
     * When the file is selected, trigger the upload event.
     */
    @HostListener('click', [])
    onClick(): void {
        const input: HTMLInputElement = document.createElement('input');
        input.style.display = 'none';
        input.type = 'file';
        input.multiple = true;
        input.addEventListener('change', () => this.upload.emit(Array.from(input.files ?? []) ) );
        input.click();
    }
}

@Component({
    selector: 'errors',
    template: '<div class="errors">@for(error of errors; track error) { <p>{{ error }} </p> }</div>',
})
export class ErrorsDisplayComponent {
    @Input() errors: string[] = [];
}

import { YabaDropFileDirective } from 'app/controls/dropfile.directive';
import { InstitutionSelectComponent } from 'app/controls/institution-select.component';

export const components = [
    ActionsDirective,
    AddDirective,
    CloseDirective,
    DebugDirective,
    EditDirective,
    InspectDirective,
    QuestionDirective,
    SaveDirective,
    SettingsDirective,
    TrashDirective,
    YesDirective,
    UploadDirective,
    ErrorsDisplayComponent,
    YabaDropFileDirective,
    InstitutionSelectComponent,
  ];
  