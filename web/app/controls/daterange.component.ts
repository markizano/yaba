
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DEFAULT_DATERANGE } from "app/lib/structures";

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

    constructor() {
        this.fromDate = new Date(Date.now() - DEFAULT_DATERANGE);
        this.toDate = new Date();
    }

    /**
     * In this way, if either date object is changed, both are sent an update event.
     * @param $event {Event} Event object from the DOM
     */
    changed() {
        this.fromDateChange.emit( this.fromDate );
        this.toDateChange.emit( this.toDate );
    }
}

