import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { Tags } from 'app/lib/types';
import { YabaAnimations } from 'app/lib/animations';
import { Transactions } from 'app/lib/transactions';
import { TransactionFilterModule } from 'app/tables/transactions/transaction-filters/transaction-filter.module';
import { ControlsModule } from 'app/controls/controls.module';

@Component({
    selector: 'yaba-untag-txns',
    templateUrl: './txn-untag.html',
    styleUrls: ['./txn-untag.css'],
    animations: [ YabaAnimations.fadeSlideDown() ],
    imports: [
        ControlsModule,
        TransactionFilterModule,
    ]
})
export class UntagTransactionComponent {
    @Input() transactions = new Transactions();
    @Output() untag = new EventEmitter<Tags>();
    @Output() cancel = new EventEmitter<void>();
    listening = false;
    tags = <Tags>[];

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
        // console.log('UntagTransactionComponent.cancel()');
        this.listening = false;
        this.cancel.emit();
    }

    budget($event: Tags) {
        // console.log('UntagTransactionComponent().budget(): ', $event);
        this.tags = $event;
    }
}

