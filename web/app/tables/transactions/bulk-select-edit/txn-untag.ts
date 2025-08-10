import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { Tags } from 'app/lib/types';
import { YabaAnimations } from 'app/lib/animations';
import { Transactions } from 'app/lib/transactions';

@Component({
    selector: 'yaba-untag-txns',
    templateUrl: './txn-untag.html',
    styleUrls: ['./txn-untag.css'],
    standalone: false,
    animations: [ YabaAnimations.fadeSlideDown() ],
})
export class UntagTransactionComponent {
    @Input() transactions = new Transactions();
    @Output() untag = new EventEmitter<Tags>();
    @Output() cancel = new EventEmitter<void>();
    listening = false;
    tags = new Tags();

    @HostListener('click', ['$event'])
    onClick($event: MouseEvent) {
        if ( typeof $event.preventDefault !== 'undefined' ) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        if ( this.listening ) { return; }
        this.listening = true;
    }

    checkInput(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.confirm(this.tags);
        } else if (event.key === 'Escape') {
            this.cancelForm();
        }
    }

    confirm(tags: Tags) {
        // console.log('UntagTransactionComponent.confirm() ', tags);
        this.untag.emit(tags);
        this.listening = false;
    }

    cancelForm() {
        // console.log('UntagTransactionComponent().cancel()');
        this.listening = false;
        this.cancel.emit();
    }
}

