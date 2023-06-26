import { Component, Input } from '@angular/core';
/**
 * This component is responsible for displaying the details of a single account.
 */
@Component({
  selector: 'yaba-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  standalone: true,
})
export class AccountComponent {
  @Input() public id?: string;

  constructor() {
    console.log('AccountComponent constructor');
  }
}
