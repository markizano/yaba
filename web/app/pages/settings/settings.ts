import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { MatChipInputEvent, MatChipEvent, MatChipEditedEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Settings } from 'app/lib/settings';
import { InstitutionsService } from 'app/services/institutions.service';
import { AccountsService } from 'app/services/accounts.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Institutions } from 'app/lib/institutions';
import { Accounts } from 'app/lib/accounts';

type TagType = 'incomeTags' | 'expenseTags' | 'transferTags' | 'hideTags';

/**
 * Settings help configure the application.
 * Settings are also just stored in local storage. It's a simple configuration data structure with no sensitive information.
 * Just preferences.
 *
 * @FutureFeature Themes: Ability to change the color scheme of the application based on a few pre-defined themes.
 */
@Component({
  selector: 'yaba-settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
  standalone: false,
})
export class SettingsComponent {
  title = 'Settings';
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  settings = new Settings();

  // ViewChild references for input elements
  @ViewChild('incomeInput') incomeInput!: ElementRef<HTMLInputElement>;
  @ViewChild('expenseInput') expenseInput!: ElementRef<HTMLInputElement>;
  @ViewChild('transferInput') transferInput!: ElementRef<HTMLInputElement>;
  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

  institutionsService = inject(InstitutionsService);
  accountsService = inject(AccountsService);

  ngOnInit() {
    // Load settings from local storage
    const settingsStr = localStorage.getItem('settings');
    if ( settingsStr ) {
      console.log('Loading settings from local storage');
      this.settings = Settings.fromString(settingsStr);
    } else {
      console.log('No settings to load?');
    }
  }

  /**
   * Add a new tag to the respective list.
   */
  add(tagKey: TagType, $event: MatChipInputEvent) {
    // Add a new tags to respective list
    if (!$event.value) { console.warn('ignoring empty tag'); return; }
    console.log('add: ', tagKey, $event);

    let inputElement: ElementRef<HTMLInputElement> | undefined;

    switch (tagKey) {
      case 'incomeTags':
        this.settings.incomeTags.push($event.value);
        inputElement = this.incomeInput;
        break;
      case 'expenseTags':
        this.settings.expenseTags.push($event.value);
        inputElement = this.expenseInput;
        break;
      case 'transferTags':
        this.settings.transferTags.push($event.value);
        inputElement = this.transferInput;
        break;
      case 'hideTags':
        this.settings.hideTags.push($event.value);
        inputElement = this.hiddenInput;
        break;
      default:
        console.error('Unknown tagSet:', tagKey);
        return;
    }

    // Clear the input after adding the chip
    if (inputElement && inputElement.nativeElement) {
      inputElement.nativeElement.value = '';
    }

    this.save();
  }

  /**
   * Edit the tag in the list by replacing the value.
   * @param tagKey
   * @param tagValue
   * @param $event
   */
  edit(tagKey: TagType, tagValue: string, $event: MatChipEditedEvent) {
    console.log('edit: ', tagKey, tagValue, $event);
    switch (tagKey) {
      case 'incomeTags':
        this.settings.incomeTags.delete(tagValue);
        if ($event.value) {
          this.settings.incomeTags.push($event.value);
        }
        break;
      case 'expenseTags':
        this.settings.expenseTags.delete(tagValue);
        if ($event.value) {
          this.settings.expenseTags.push($event.value);
        }
        break;
      case 'transferTags':
        this.settings.transferTags.delete(tagValue);
        if ($event.value) {
          this.settings.transferTags.push($event.value);
        }
        break;
      case 'hideTags':
        this.settings.hideTags.delete(tagValue);
        if ($event.value) {
          this.settings.hideTags.push($event.value);
        }
        break;
      default:
        console.error('Unknown tagSet:', tagKey);
    }
    this.save();
  }

  /**
   * Remove the tag from the list.
   * @param tagKey
   * @param $event.value
   */
  remove(tagKey: TagType, $event: MatChipEvent) {
    console.log('remove: ', tagKey, $event);
    const chipValue = $event.chip.value;
    if (!chipValue) {
      console.warn('No chip value found for removal');
      return;
    }
    switch (tagKey) {
      case 'incomeTags':
        this.settings.incomeTags.delete(chipValue);
        break;
      case 'expenseTags':
        this.settings.expenseTags.delete(chipValue);
        break;
      case 'transferTags':
        this.settings.transferTags.delete(chipValue);
        break;
      case 'hideTags':
        this.settings.hideTags.delete(chipValue);
        break;
      default:
        console.error('Unknown tagSet:', tagKey);
    }
    this.save();
  }

  /**
   * Save the settings to local storage.
   */
  save() {
    // Save settings to local storage
    console.log('Saving settings to local storage', this.settings);
    localStorage.setItem('settings', this.settings.toString());
  }

  /**
   * Export settings and contents of all data to zip file.
   */
  export2zip() {
    const jzip = new JSZip();
    this.institutionsService.get().toCSV(jzip);
    this.accountsService.get().toCSV(jzip);
    jzip.file('settings.json', this.settings.toString());
    jzip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `yaba-export-${new Date().toISOShortDate()}.zip`);
    });
  }

  /**
   * Imports settings from zip file.
   */
  importFromZip($event: Event) {
    const $element = $event.target as HTMLInputElement;
    const file = $element.files?.item(0);
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent) => {
        console.log('importFromZip().e: ', e);
        const jzip = new JSZip();

        const zip = await jzip.loadAsync(<string>reader.result);
        const settings: string = await zip.file('settings.json')?.async('string') ?? '{}';
        console.log('Imported settings:', settings);
        this.settings = Settings.fromString(settings);
        localStorage.setItem('settings', settings);

        const institutions = await new Institutions().fromZIP(zip);
        console.log('Imported institutions:', institutions);
        this.institutionsService.save(institutions);

        const accounts = await new Accounts().fromZIP(zip);
        console.log('Imported accounts:', accounts);
        this.accountsService.save(accounts);

        // @TODO: Notice to the end-user this was completed successfully.
        // Something like this.messagingService.send(priority=,msg=) / localStorage.setItem('message', 'The message...') maybe?
        $element.value = ''; // Clear the file input for the next upload.

      };
      reader.readAsArrayBuffer(file);
    } else {
      console.log('No file selected');
    }
  }

  deleteAll() {
    // Delete all the data!
  }
}


