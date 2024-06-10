import { Component, Input, Output, EventEmitter } from '@angular/core';

import { InstitutionMapping, MapTypes } from 'app/lib/institutions';
import { TransactionFields } from 'app/lib/transactions';
import { ControlsModule } from 'app/controls/controls.module';

@Component({
  selector: 'institution-mapping',
  templateUrl: './institution-mapping.component.html',
  standalone: true,
  imports: [
    ControlsModule,
  ],
})
export class InstitutionMappingComponent {
    @Input() index = 0;
    @Input() mapping: InstitutionMapping;
    @Output() mappingChange = new EventEmitter<InstitutionMapping>();
    @Input() fields: {label: string, value: TransactionFields}[] = [];
    @Output() fieldsChange = new EventEmitter<TransactionFields>();
    @Output() remove = new EventEmitter<number>();

    readonly MapTypes = MapTypes;

    constructor() {
        this.mapping = new InstitutionMapping('', TransactionFields.UNKNOWN, MapTypes.csv);
    }

    protected _remove() {
        this.remove.emit(this.index);
    }

    /**
     * When a field is selected, inform the parent Component so that it can update the related variable.
     * @param toFieldSelect 
     */
    onToField(toFieldSelect: HTMLSelectElement) {
        this.mapping.toField = toFieldSelect.value as TransactionFields;
        this.mappingChange.emit(this.mapping);
        this.fieldsChange.emit(this.mapping.toField);
    }
}
