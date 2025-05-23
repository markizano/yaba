import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription, debounceTime } from "rxjs";

import { DEFAULT_DATERANGE } from "app/lib/constants";
import { DateRange } from "app/lib/types";

@Component({
    selector: 'yaba-daterange',
    templateUrl: './daterange.component.html',
    imports: [
        CommonModule,
        FormsModule
    ]
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
        this.#fromDateSub = this.fromDateChange.pipe(debounceTime(2000)).subscribe(() => this.dateChanged());
        this.#toDateSub = this.toDateChange.pipe(debounceTime(2000)).subscribe(() => this.dateChanged());
    }

    ngOnDestroy() {
        this.#fromDateSub?.unsubscribe();
        this.#toDateSub?.unsubscribe();
    }

    dateChanged() {
        this.changed.emit(<DateRange>{ fromDate: new Date(this.fromDate), toDate: new Date(this.toDate) });
    }
}

