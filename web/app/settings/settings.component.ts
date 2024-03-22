import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule, MatChipInputEvent, MatChipEvent, MatChipEditedEvent } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { PayCycle, TransactionDeltas, ShowTransactions } from 'app/lib/structures';
import { ControlsModule } from 'app/controls/controls.module';

@Component({
  selector: 'yaba-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule,
    ControlsModule,
  ],
  standalone: true,
})
export class SettingsComponent {
  title = 'Settings';
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  payCycle: PayCycle;
  txnDelta: TransactionDeltas;
  incomeTags: string[];
  expenseTags: string[];
  transferTags: string[];
  hideTags: string[];
  txShow: ShowTransactions;

  constructor() {
    this.payCycle = PayCycle.BiMonthly;
    this.txnDelta = TransactionDeltas.days30;
    this.incomeTags = [ 'income' ];
    this.expenseTags = [ 'expense' ];
    this.transferTags = [ 'transfer' ];
    this.hideTags = [ 'hide' ];
    this.txShow = {
      id: true,
      datePending: true,
      merchant: true,
      account: true,
      transactionType: true,
    };
  }

  public add(tagSet: string, $event: MatChipInputEvent) {
    // Add a new tags to respective list
    console.log([tagSet, $event]);
    switch (tagSet) {
      case 'incomeTags':
        this.incomeTags.push($event.value);
        break;
      case 'expenseTags':
        this.expenseTags.push($event.value);
        break;
      case 'transferTags':
        this.transferTags.push($event.value);
        break;
      case 'hideTags':
        this.hideTags.push($event.value);
        break;
      default:
        console.error('Unknown tagSet:', tagSet);
    }
  }

  public save() {
    // Save settings to local storage
  }

  public edit($event: MatChipEditedEvent) {
    // Edit settings in local storage
    console.log($event);
  }

  public remove($event: MatChipEvent) {
    // Remove settings from local storage
    console.log($event);
  }

  public export2zip() {
    // Export settings to zip file
  }

  public importFromZip() {
    // Import settings from zip file
  }

  public deleteAll() {
    // Delete all the data!
  }
}
