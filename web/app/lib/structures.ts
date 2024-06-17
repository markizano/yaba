declare global {
    interface Date {
        toISOShortDate(): string;
        round(): Date;
    }
}

/**
 * Returns a YYYY-MM-DD formatted string of the date.
 * @returns {string} YYYY-MM-DD formatted string of the date.
 */
Object.defineProperties(Date.prototype, {
    'toISOShortDate': {
        value: function toISOShortDate(): string {
            const yyyy = this.getFullYear(),
            mm = ('0' + (this.getUTCMonth()+1)).slice(-2),
            dd = ( '0' + this.getUTCDate()).slice(-2);
            return [yyyy, mm, dd] .join('-')
        }
    },
    'round': {
        value: function round(): Date {
            const result = new Date(this);
            result.setUTCMilliseconds(0);
            result.setUTCSeconds(0);
            result.setUTCMinutes(0);
            result.setUTCHours(0);
            result.setUTCDate(1);
            return result;
        }
    }
});

export function parseCurrency(value: string): number {
    return Number(value.replace(/[^0-9.-]+/g, '') );
}

/**
 * @param {Date} NULLDATE Object we can use for NULL but also instanceof Date().
 */
export const NULLDATE = new Date('1970-01-01T00:00:00');

/**
 * @param {number} CACHE_EXPIRY_SECONDS Number of seconds before client-store cache expires.
 */
export const CACHE_EXPIRY_SECONDS = 120;

/**
 * Description + Regexp Struct for sending description update change events.
 */
export interface DescriptionChange {
    description: string|RegExp;
    useRegexp: boolean;
}

/**
 * enum(PayCycle). Set of key-value pairs of pay cycles.
 */
export enum PayCycle {
    Weekly = 'weekly',
    BiWeekly = 'bi-weekly',
    BiMonthly = 'bi-monthly',
    Monthly = 'monthly',
}

/**
 * enum(FormMode). Set of key-value pairs of form modes.
 * Used to determine whether we're creating or editing a form.
 */
export enum FormMode {
    Create = 'create',
    Edit = 'edit',
}

/**
 * enum(TransactionDeltas). Possible default transaction history values
 * we'd use when rendering transaction history.
 */
export enum TransactionDeltas {
    days30 =  2592000000,
    days60 =  5184000000,
    days90 =  7776000000,
    days180 = 15552000000,
    days365 = 31104000000,
    days730 = 62208000000,
}

/**
 * Used in settings and txn-list to determine which headers/columns to show.
 */
export interface TransactionShowHeaders {
    id: boolean;
    datePending: boolean;
    merchant: boolean;
    account: boolean;
    transactionType: boolean;
}

export enum CurrencyType {
    USD = 'USD',
    CAD = 'CAD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    AUD = 'AUD',
    NZD = 'NZD',
    CHF = 'CHF',
    HKD = 'HKD',
    SGD = 'SGD',
    SEK = 'SEK',
    DKK = 'DKK',
    PLN = 'PLN',
    NOK = 'NOK',
    HUF = 'HUF',
    CZK = 'CZK',
    ILS = 'ILS',
    MXN = 'MXN',
    PHP = 'PHP',
    THB = 'THB',
    TWD = 'TWD',
    TRY = 'TRY',
    RUB = 'RUB',
    BRL = 'BRL',
    ZAR = 'ZAR',
    INR = 'INR',
    MYR = 'MYR',
    IDR = 'IDR',
    KRW = 'KRW',
    KWD = 'KWD',
    SAR = 'SAR',
}

export interface Storables {
    save(): void;
    load(): void;
}

export interface UserPreferences {
    incomeTags: string[];
    expenseTags: string[];
    transferTags: string[];
    hideTags: string[];
    txShow: TransactionShowHeaders;
    payCycle: PayCycle;
    txnDelta: TransactionDeltas;
}

/**
 * Object to store settings and interfaces with the localStorage in order to accomplish this.
 */
export class Settings implements UserPreferences {
    incomeTags: string[];
    expenseTags: string[];
    transferTags: string[];
    hideTags: string[];
    txShow: TransactionShowHeaders;
    payCycle: PayCycle;
    txnDelta: TransactionDeltas;

    constructor(incomeTags?: string[], expenseTags?: string[], transferTags?: string[], hideTags?: string[], txShow?: TransactionShowHeaders, payCycle?: PayCycle, txnDelta?: TransactionDeltas) {
        this.incomeTags = incomeTags || [];
        this.expenseTags = expenseTags || [];
        this.transferTags = transferTags || [];
        this.hideTags = hideTags || [];
        this.txShow = txShow || <TransactionShowHeaders>{};
        this.payCycle = payCycle || PayCycle.Weekly;
        this.txnDelta = txnDelta || TransactionDeltas.days30;
    }

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
