
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DEFAULT_DATERANGE } from "app/lib/constants";
import { DateRange } from "app/lib/types";

@Component({
    selector: 'yaba-daterange',
    templateUrl: './daterange.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule ],
})
export class DateRangeFilterComponent {
    @Input() fromDate: Date;
    @Output() fromDateChange = new EventEmitter<Date>();

    @Input() toDate: Date;
    @Output() toDateChange = new EventEmitter<Date>();

    @Output() changed: EventEmitter<DateRange> = new EventEmitter<DateRange>();

    constructor() {
        this.fromDate = new Date(Date.now() - DEFAULT_DATERANGE);
        this.toDate = new Date();
        this.fromDateChange.subscribe((fromDate) => {
            this.changed.emit(<DateRange>{ fromDate: new Date(fromDate), toDate: new Date(this.toDate) });
        });
        this.toDateChange.subscribe((toDate) => {
            this.changed.emit(<DateRange>{ fromDate: new Date(this.fromDate), toDate: new Date(toDate) });
        });
    }

    dateChanged() {
        this.changed.emit(<DateRange>{ fromDate: new Date(this.fromDate), toDate: new Date(this.toDate) });
    }
}

