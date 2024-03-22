import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'yaba-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    MatListModule,
    MatChipsModule,
  ],
  standalone: true,
})
export class SettingsComponent {
  title = 'Settings';
  settings = [
    { name: 'Notifications', icon: 'notifications' },
    { name: 'Profile', icon: 'person' },
    { name: 'Language', icon: 'language' },
    { name: 'Privacy', icon: 'lock' },
    { name: 'Security', icon: 'security' },
    { name: 'About', icon: 'info' },
  ];
}
