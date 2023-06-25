import { Injectable } from '@angular/core';
import { Settings, Storables } from 'app/lib/structures';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements Storables {
  protected settings?: Settings;
  constructor() {
    this.settings = new Settings();
  }

  public save(): void {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }

  public load(): void {
    const userSettings = localStorage.getItem('settings');
    if ( userSettings ) {
      this.settings = new Settings().load(JSON.parse(userSettings));
    }
  }
}
