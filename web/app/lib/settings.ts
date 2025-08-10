import { Tags, TransactionShowHeaders } from "app/lib/types";
import { PayCycle, TransactionDeltas } from "app/lib/structures";

export interface UserPreferences {
    incomeTags: Tags;
    expenseTags: Tags;
    transferTags: Tags;
    hideTags: Tags;
    txShow: TransactionShowHeaders;
    payCycle: PayCycle;
    txnDelta: TransactionDeltas;
    useServer: boolean;
}

/**
 * Object to store settings and interfaces with the localStorage in order to accomplish this.
 */
export class Settings implements UserPreferences {
    incomeTags: Tags = new Tags();
    expenseTags: Tags = new Tags();
    transferTags: Tags = new Tags();
    hideTags: Tags = new Tags();
    txShow: TransactionShowHeaders = <TransactionShowHeaders>{};
    payCycle: PayCycle = PayCycle.Weekly;
    txnDelta: TransactionDeltas = TransactionDeltas.days30;
    useServer: boolean = false;

    /**
     * Read the local storage for our settings.
     * This should not override any existing settings.
     * @param {Settings} data Settings object to load.
     * @return {Settings} "this" Settings object for easy chaining.
     */
    load(data: UserPreferences): Settings {
        if ( data.incomeTags )      this.incomeTags = data.incomeTags;
        if ( data.expenseTags )     this.expenseTags = data.expenseTags;
        if ( data.transferTags )    this.transferTags = data.transferTags;
        if ( data.hideTags )        this.hideTags = data.hideTags;
        if ( data.txShow )          this.txShow = data.txShow;
        if ( data.payCycle )        this.payCycle = data.payCycle;
        if ( data.txnDelta )        this.txnDelta = data.txnDelta;
        if ( data.useServer )       this.useServer = data.useServer;
        return this;
    }

    /**
     * Load the settings from a JSON stringified object.
     * @param {string} loadString JSON stringified object to load.
     * @return {Settings}
     */
    static fromString(loadString: string): Settings {
        return new Settings().load(JSON.parse(loadString));
    }

    /**
     * Load the settings from the local storage in a one-shot method.
     * @return {Settings}
     */
    static fromLocalStorage(): Settings {
        const settingsStr = localStorage.getItem('settings');
        if ( settingsStr ) {
            return Settings.fromString(settingsStr);
        }
        return new Settings();
    }

    /**
     * Save the settings to the local storage as a JSON string.
     */
    toString(): string {
        return JSON.stringify({
            incomeTags: this.incomeTags,
            expenseTags: this.expenseTags,
            transferTags: this.transferTags,
            hideTags: this.hideTags,
            txShow: this.txShow,
            payCycle: this.payCycle,
            txnDelta: this.txnDelta,
            useServer: this.useServer,
        });
    }

    /**
     * Convert a pay cycle to milliseconds.
     * @param {PayCycle} cycle Pay cycle to convert.
     * @returns {number} Milliseconds in the pay cycle.
     */
    payCycle2ms(cycle: PayCycle): number {
        let next1st: Date, next15th: Date;
        switch (cycle) {
            case PayCycle.Weekly:
                return 7 * 24 * 60 * 60 * 1000;
            case PayCycle.BiWeekly:
                return 14 * 24 * 60 * 60 * 1000;
            case PayCycle.BiMonthly:
                next1st = new Date();
                next1st.setDate(1);
                next1st.setMonth(next1st.getMonth() + 1);
                next15th = new Date();
                next15th.setDate(15);
                next15th.setMonth(next15th.getMonth() + 1);
                return ( next15th.getTime() - next1st.getTime() ) * 1000;
            case PayCycle.Monthly:
                next1st = new Date();
                next1st.setDate(1);
                next1st.setMonth(next1st.getMonth() + 1);
                return (next1st.getTime() - new Date().getTime()) * 1000;
        }
    }
}
