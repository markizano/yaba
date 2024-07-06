import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NgSelectable } from 'app/lib/types';
import { InstitutionMapping, MapTypes } from 'app/lib/institutions';
import { YabaAnimations } from 'app/lib/animations';
import { ITransaction } from 'app/lib/transactions';
import { ControlsModule } from 'app/controls/controls.module';


@Component({
  selector: 'institution-mapping',
  templateUrl: './institution-mapping.component.html',
  standalone: true,
  animations: [
    YabaAnimations.fadeSlideDown()
  ],
  imports: [
    ControlsModule,
  ],
})
export class InstitutionMappingComponent {
    @Input() index = 0;
    @Input() mapping = new InstitutionMapping();
    @Output() mappingChange = new EventEmitter<InstitutionMapping>();
    @Input() fields: NgSelectable<keyof ITransaction>[] = [];
    @Output() fieldsChange = new EventEmitter<void>();
    @Output() remove = new EventEmitter<number>();

    protected _remove() {
        this.remove.emit(this.index);
    }

    /**
     * When a field is selected, inform the parent Component so that it can update the related variable.
     * @param toFieldSelect 
     */
    onToField(toFieldSelect: HTMLSelectElement) {
        this.mapping.toField = toFieldSelect.value as keyof ITransaction;
        this.mappingChange.emit(this.mapping);
        this.fieldsChange.emit();
    }

    isField() {
        return this.mapping.mapType == MapTypes.value
    }
}
