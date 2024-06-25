import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings } from 'app/lib/settings';

import { Transaction } from 'app/lib/transactions';
import { TransactionShowHeaders } from 'app/lib/types';
import { TxnFieldComponent } from '../txn-field/txn-field.component';

/**
 * A row in a table that represents a transaction.
 * This component is a container for a list of <txn-field> components.
 */
@Component({
    selector: '.yaba-txn-row',
    standalone: true,
    imports: [
        TxnFieldComponent,
    ],
    templateUrl: './txn-row.component.html',
})
export class TxnRowComponent {
    @Input() txn = new Transaction();
    @Output() txnChange = new EventEmitter<Transaction>();

    @Input() editable = false;
    @Input() truncate = false;

    editing = false;

    txShow: TransactionShowHeaders = Settings.fromLocalStorage().txShow;

}
