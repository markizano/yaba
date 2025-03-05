import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { ControlsModule } from 'app/controls/controls.module';
import { Settings } from 'app/lib/settings';

import { Transaction } from 'app/lib/transactions';
import { TransactionShowHeaders } from 'app/lib/types';
import { TxnFieldComponent } from 'app/tables/transactions/txn-field/txn-field.component';

/**
 * A row in a table that represents a transaction.
 * This component is a container for a list of <txn-field> components.
 */
@Component({
    selector: '.yaba-txn-row',
    standalone: true,
    imports: [
        ControlsModule,
        TxnFieldComponent,
    ],
    templateUrl: './txn-row.component.html',
})
export class TxnRowComponent {
    @Input() txn = new Transaction();
    @Output() txnChange = new EventEmitter<Transaction>();
    // Backup transaction if we decide to cancel the edit.
    #bTxn = new Transaction();

    @Output() drop = new EventEmitter<Transaction>();
    @Output() selected = new EventEmitter<boolean>();
    @Output() budgets = new EventEmitter<void>();

    @Input() editable = false;
    @Input() truncate = false;
    @Input() select = false;

    @HostBinding('class.actively-editing') editing = false;

    txShow: TransactionShowHeaders = Settings.fromLocalStorage().txShow;

    @HostListener('keydown', ['$event'])
    onKeybinding(event: KeyboardEvent) {
        if ( this.editable && this.editing ) {
            if ( event.ctrlKey && event.key === 'Enter') {
                this.save(this.txn);
            } else if (event.key === 'Escape') {
                this.cancel();
            }
        }
    }

    save(txn: Transaction) {
        this.editing = false;
        this.txnChange.emit(txn);
    }

    cancel() {
        console.log('cancel-edit-txn');
        this.editing = false;
        this.txn = this.#bTxn;
    }

    edit() {
        // create a backup transaction with a different JS reference.
        this.#bTxn = Transaction.fromObject(this.txn);
        this.editing = true;
    }

    dropTxn() {
        this.drop.emit(this.txn);
    }

    selectTxn(selected: boolean) {
        this.selected.emit(selected);
    }
}
