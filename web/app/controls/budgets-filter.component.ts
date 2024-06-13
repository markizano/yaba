import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'yaba-budgets',
    templateUrl: './budgets-filter.component.html',
    styles: [  ],
    standalone: true,
    imports: [ CommonModule, FormsModule ],
})
export class YabaFilterBudgetsComponent {
    title = 'Budgets';
    @Input() budgets: string[] = [];
    @Output() selectedBudgets = new EventEmitter<string[]>();

    changed(budget: string[]) {
        this.selectedBudgets.emit( budget );
    }
}
