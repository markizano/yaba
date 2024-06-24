
declare global {
    interface Date {
        /**
         * Returns a YYYY-MM-DD formatted string of the date.
         */
        toISOShortDate(): string;

        /**
         * Returns a new Date object with the time rounded back to the nearest day.
         */
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

