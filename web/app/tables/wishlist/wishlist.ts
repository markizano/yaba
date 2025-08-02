import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ControlsModule } from 'app/controls/controls.module';
import { Transaction, Transactions } from 'app/lib/transactions';

/**
 * Wishlist Editing Component for widget
 * Helps the user edit stuff for their wishlist on the prospecting page.
 */
@Component({
    selector: 'yaba-wishlist',
    templateUrl: './wishlist.html',
    styleUrls: ['./wishlist.css'],
    imports: [
        ControlsModule,
        MatIconModule,
    ],
})
export class WishlistComponent {
    @Input() wishlist: Transactions = new Transactions();
    @Output() wishlistChange = new EventEmitter<Transactions>();

    /* The item in question for editing. */
    item: Transaction = new Transaction();

    /* Are we editing this item or adding a new one? */
    editing: boolean = false;

    add() {
        this.wishlist.add(this.item);
        this.item = new Transaction();
        this.editing = false;
    }

    edit(index: number) {
        this.editing = true;
        this.item = this.wishlist[index];
    }

    remove(id: string) {
        this.wishlist.remove(id);
    }

    cancel() {
        this.editing = false;
        this.item = new Transaction();
    }

    save() {
        this.item = new Transaction();
        this.editing = false;
    }
}
