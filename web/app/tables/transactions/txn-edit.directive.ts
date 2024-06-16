import { Directive, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';

@Directive({
    selector: '[txnEdit]',
    standalone: true,
})
export class TxnEditDirective {

    @Input() txnEdit: boolean;
    @Output() txnEditChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
        this.txnEdit = false;
    }

    @HostBinding('class.active-editing')
    get isEditing() {
        return this.txnEdit;
    }

    @HostListener('click', ['$event'])
    onClick() {
        this.txnEdit = true;
        this.txnEditChange.emit(this.txnEdit);
    }

    @HostListener('blur', ['$event'])
    onBlur() {
        this.txnEdit = false;
        this.txnEditChange.emit(this.txnEdit);
    }
}
