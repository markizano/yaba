
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'yaba-daterange',
    templateUrl: './daterange.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule ],
})
export class YabaFilterDateRangeComponent {
    title = 'Date Range';
    @Input() fromDate: Date;
    @Input() toDate: Date;
    @Output() fromDateChange = new EventEmitter<Date>();
    @Output() toDateChange = new EventEmitter<Date>();

    constructor() {
        this.fromDate = new Date();
        this.toDate = new Date();
    }

    /**
     * In this way, if either date object is changed, both are sent an update event.
     * @param $event {Event} Event object from the DOM
     */
    changed($event: Event) {
        console.log($event);
        this.fromDateChange.emit( this.fromDate );
        this.toDateChange.emit( this.toDate );
    }
}

