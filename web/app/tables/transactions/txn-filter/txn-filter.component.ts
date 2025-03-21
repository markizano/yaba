import { Component, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

import { DateRange, DescriptionChange, TransactionFilter, Tags } from 'app/lib/types';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Accounts } from 'app/lib/accounts';
import { TagsFilterComponent } from 'app/controls/tags-filter.component';
import { ControlsModule } from 'app/controls/controls.module';
import { Subscription } from 'rxjs';

/**
 * This is a glue component that combines the various filters into a single component
 * and joins their events into a single handler.
 * 
 * In this way, you can <transaction-filters> and have a single event handler for all the filters.
 * Each time a filter component changes, the filter object will also change and allow subscriptions
 * to changes. Changes are bubbled up to the parent component thru this transitory component.
 * 
 * This is just a view to render the transaction filters to the end user. This is also input from
 * the user to identify the filters. In this way, no transactions need to be filtered from here and
 * can only transmit the filter object to the parent component.
 * 
 * @Input/@Output {TransactionFilter} filter - The filter object to be updated by the filters.
 */
@Component({
    selector: 'transaction-filters',
    templateUrl: './txn-filter.component.html',
    standalone: true,
    imports: [
        ControlsModule,
        TagsFilterComponent,
    ],
})
export class TransactionFilterComponent {
    @Input()  filter = EMPTY_TRANSACTION_FILTER;
    @Output() filterChange = new EventEmitter<TransactionFilter>();
    filterByAccount: boolean = this.filter.accounts !== undefined;
    tags: Tags = [];
    #subChg?: Subscription;

    ngOnInit() {
        this.#subChg = this.filterChange.subscribe((filter: TransactionFilter) => {
            this.filterByAccount = filter.accounts !== undefined;
        });
        console.log('TransactionFilterComponent().ngOnInit()');
    }

    ngOnDestroy() {
        this.#subChg?.unsubscribe();
    }

    daterange($event: DateRange) {
        this.filter.fromDate = new Date($event.fromDate);
        this.filter.toDate = new Date($event.toDate);
        this.filterChange.emit(this.filter);
    }

    accounts($event: Accounts): void {
        this.filter.accounts = $event;
        this.filterChange.emit(this.filter);
    }

    selectedTags($event: Tags): void {
        this.filter.tags = $event;
        this.filterChange.emit(this.filter);
    }

    description($event: DescriptionChange) {
        this.filter.description = $event.useRegexp ? new RegExp($event.description) : $event.description;
        console.debug('description', this.filter.description);
        this.filterChange.emit(this.filter);
    }
}
