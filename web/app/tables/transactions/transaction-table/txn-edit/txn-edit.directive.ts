import { Directive, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';

/**
 * Definition of "editable":
 *   This field is editable.
 *   A [click] event will add the "editing" class so other handlers of that html-class
 *   can perform the functions they need to put it in editing mode, render inputs as
 *   needed and allow user interaction with the element(s).
 *   An [Esc] keypress is a "cancel" event which indicates the changes should be
 *   reversed and the "editing" class to be removed.
 *   An [Ctrl+Enter] keypress is an "OK" event which indicates a commit of the changes,
 *   a removal of the "editing" class.
 *
 * Definition of "editing":
 *   Indicates this field is actively under edits. Input fields are rendered and
 *   user interaction is possible.
 */
@Directive({
    selector: '.editable',
    standalone: true,
})
export class TxnEditDirective {

  /**
   * Two-way binding of the acitvely "editing" state.
   */
  editing: boolean = false;

  /**
   * Absolutely cancels the form.
   */
  @Output() cancelChanges: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Confirms the changes.
   */
  @Output() confirmChanges: EventEmitter<void> = new EventEmitter<void>();

  @HostBinding('class.editing')
  get isEditing() {
    return this.editing;
  }

  @HostListener('click', ['$event'])
  onClick() {
      // this.txnEdit = true;
      this.editing = true;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.editing = false;
      this.cancelChanges.emit();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      this.editing = false;
      this.confirmChanges.emit();
    }
  }
}
