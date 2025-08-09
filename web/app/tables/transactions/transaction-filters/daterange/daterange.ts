import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription, debounceTime } from "rxjs";

import { DEFAULT_DATERANGE } from "app/lib/constants";
import { DateRange } from "app/lib/types";

@Component({
    selector: 'yaba-daterange',
    standalone: false,
    templateUrl: './daterange.html',
    styleUrls: ['./daterange.css'],
})
export class DateRangeFilterComponent {
    @Input() fromDate: Date;
    @Output() fromDateChange = new EventEmitter<Date>();
    #fromDateSub?: Subscription;

    @Input() toDate: Date;
    @Output() toDateChange = new EventEmitter<Date>();
    #toDateSub?: Subscription;

    @Output() changed: EventEmitter<DateRange> = new EventEmitter<DateRange>();

    constructor() {
        this.fromDate = new Date(Date.now() - DEFAULT_DATERANGE);
        this.toDate = new Date();
    }

    ngOnInit() {
        this.#fromDateSub = this.fromDateChange.pipe(debounceTime(385)).subscribe(() => this.dateChanged());
        this.#toDateSub = this.toDateChange.pipe(debounceTime(385)).subscribe(() => this.dateChanged());
    }

    ngOnDestroy() {
        this.#fromDateSub?.unsubscribe();
        this.#toDateSub?.unsubscribe();
    }

    dateChanged() {
        this.changed.emit(<DateRange>{ fromDate: new Date(this.fromDate), toDate: new Date(this.toDate) });
    }
}

