import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Description, DescriptionChange } from 'app/lib/types';
import { Subscription, debounceTime } from 'rxjs';

/**
 * Description component does not require any input since it is just a textbox to receive input from the user.
 * Return the user's changes as a series of events that can be used to filter the transactions.
 * Include the useRegexp flag to allow the user to use regular expressions in the description filter.
 */
@Component({
    selector: 'yaba-description',
    templateUrl: './description.html',
    styleUrls: ['./description.css'],
    imports: [
        FormsModule
    ]
})
export class DescriptionFilterComponent {
    description: Description = '';
    descriptionChanged = new EventEmitter<Description>();
    #descriptionSub?: Subscription;

    useRegexp = false;
    useRegexpChanged = new EventEmitter<boolean>();
    #useRegexpSub?: Subscription;

    @Output() changed = new EventEmitter<DescriptionChange>();

    ngOnInit() {
        this.#descriptionSub = this.descriptionChanged.pipe(debounceTime(385)).subscribe(() => this.onChanged());
        this.#useRegexpSub = this.useRegexpChanged.pipe(debounceTime(385)).subscribe(() => this.onChanged());
    }

    ngOnDestroy() {
        this.#descriptionSub?.unsubscribe();
        this.#useRegexpSub?.unsubscribe();
    }

    onChanged() {
        console.debug('DescriptionFilterComponent.onChanged()', this.description, this.useRegexp);
        this.changed.emit({description: this.description, useRegexp: this.useRegexp});
    }
}
