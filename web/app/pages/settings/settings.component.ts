import { Component } from '@angular/core';
import { MatChipInputEvent, MatChipEvent, MatChipEditedEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Settings } from 'app/lib/settings';
import { InstitutionsService } from 'app/services/institutions.service';
import { AccountsService } from 'app/services/accounts.service';
import * as JSZip from 'jszip';
// import { saveAs } from 'file-saver';

type TagType = 'incomeTags' | 'expenseTags' | 'transferTags' | 'hideTags';
@Component({
    selector: 'yaba-settings',
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    title = 'Settings';
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    settings = new Settings();

    constructor(protected institutionsService: InstitutionsService, protected accountsService: AccountsService) { }

    ngOnInit() {
        // Load settings from local storage
        const settingsStr = localStorage.getItem('settings');
        if ( settingsStr ) {
            console.log('Loading settings from local storage');
            this.settings = Settings.fromString(settingsStr);
        }
    }
    /**
     * Add a new tag to the respective list.
     * @param tagKey 
     * @param tagValue 
     * @param $event 
     */
    add(tagKey: TagType, $event: MatChipInputEvent) {
        // Add a new tags to respective list
        console.log('add: ', tagKey, $event);
        switch (tagKey) {
            case 'incomeTags':
                this.settings.incomeTags.push($event.value);
                break;
            case 'expenseTags':
                this.settings.expenseTags.push($event.value);
                break;
            case 'transferTags':
                this.settings.transferTags.push($event.value);
                break;
            case 'hideTags':
                this.settings.hideTags.push($event.value);
                break;
            default:
                console.error('Unknown tagSet:', tagKey);
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
                this.settings.incomeTags[this.settings.incomeTags.indexOf(tagValue)] = $event.value;
                break;
            case 'expenseTags':
                this.settings.expenseTags[this.settings.expenseTags.indexOf(tagValue)] = $event.value;
                break;
            case 'transferTags':
                this.settings.transferTags[this.settings.transferTags.indexOf(tagValue)] = $event.value;
                break;
            case 'hideTags':
                this.settings.hideTags[this.settings.hideTags.indexOf(tagValue)] = $event.value;
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
        switch (tagKey) {
            case 'incomeTags':
                this.settings.incomeTags.splice(this.settings.incomeTags.indexOf($event.chip.value), 1);
                break;
            case 'expenseTags':
                this.settings.expenseTags.splice(this.settings.expenseTags.indexOf($event.chip.value), 1);
                break;
            case 'transferTags':
                this.settings.transferTags.splice(this.settings.transferTags.indexOf($event.chip.value), 1);
                break;
            case 'hideTags':
                this.settings.hideTags.splice(this.settings.hideTags.indexOf($event.chip.value), 1);
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

    export2zip() {
        // Export settings and contents of all data to zip file.
        const zip = new JSZip();
        this.institutionsService.get().toCSV(zip);
        this.accountsService.get().toCSV(zip);
        zip.file('settings.json', this.settings.toString());
        // zip.generateAsync({ type: 'blob' }).then((content) => {
        //     saveAs(content, `yaba-export-${new Date().toISOShortDate()}.zip`);
        // });
    }

    importFromZip() {
        // Import settings from zip file
    }

    deleteAll() {
        // Delete all the data!
    }
}


