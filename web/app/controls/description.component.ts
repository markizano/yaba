import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Description } from 'app/lib/types';

@Component({
    selector: 'yaba-description',
    templateUrl: './description.component.html',
    styles: [  ],
    standalone: true,
    imports: [ CommonModule, FormsModule ],

})
export class DescriptionFilterComponent {
    @Input() description?: Description;
    @Output() descriptionChange = new EventEmitter<Description>();
    useRegexp: boolean;

    @Output() changed = new EventEmitter<Description>();

    constructor() {
        this.description = '';
        this.useRegexp = false;
    }

    onChanged(description: Description) {
        this.description = this.useRegexp ? new RegExp(description) : description;
        this.changed.emit(this.description);
    }
}
