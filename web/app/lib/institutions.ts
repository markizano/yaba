import { v4 } from 'uuid';
import * as JSZip from 'jszip';
import { Papa, ParseConfig, ParseResult } from 'ngx-papaparse';
import { TransactionFields } from 'app/lib/transactions';
import { Id2NameHashMap, YabaPlural } from 'app/lib/types';

/**
 * @enum MapTypes Valid mapping types. To later support function() types as well for things
 * like change the sign and make it negative, perform a regexp replacement on a description or perform
 * some calculation based on related fields in this transaction.
 */
export enum MapTypes {
    csv = 'static',
    dynamic = 'dynamic',
    function = 'function', // @TODO: Support this
}

export interface IMapping {
    fromField: string;
    toField: TransactionFields;
    mapType: MapTypes;
    toString(): string;
}

/**
 * InstitutionMapping objectlet for Institution().mappings. This has been used enough to make it a real
 * thing we can use for importing/exporting and otherwise managing institution mappings.
 */
export class InstitutionMapping implements IMapping {
    public fromField: string;
    public toField: TransactionFields;
    public mapType: MapTypes;

    constructor(fromField: string, toField: TransactionFields, mapType: MapTypes) {
        this.fromField = fromField;
        this.toField = toField;
        this.mapType = mapType;
    }

    /**
     * Override for this.toString();
     * @returns {String}
     */
    public toString(): string {
        return JSON.stringify({
            fromField: this.fromField,
            toField: this.toField,
            mapType: this.mapType
        });
    }
}

export class InstitutionMappings extends Array<IMapping> {
    constructor(...items: IMapping[]|InstitutionMappings|number[]) {
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item: IMapping = items[i] as IMapping;
                if ( true === item instanceof InstitutionMapping ) {
                    continue
                }
                items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType);
            }
        }
        super(...<IMapping[]>items);
    }

    /**
     * Override of the push() function to ensure that each item added to the array is of type `InstitutionMapping`.
     * @param  {...InstitutionMapping|object} items Items to push onto the array.
     * @returns Number of items in the current set/array.
     */
    public add(...items: IMapping[]|InstitutionMappings ): number {
        for ( const i in items ) {
            const item = items[i];
            item instanceof InstitutionMapping || (items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType));
        }
        return super.push(...items);
    }

    /**
     * Override for this.toString();
     * @returns {String}
     */
    public override toString(): string {
        return JSON.stringify(this);
    }

    /**
     * Remove a mapping from this collection
     * @param {String} fromField Field to remove from the mapping.
     * @returns {InstitutionMappings} Returns this object for chaining..
     */
    public removeMapping(mapping: IMapping): InstitutionMappings {
        const index = this.findIndex((item: IMapping) => item.fromField === mapping.fromField && item.toField === mapping.toField && item.mapType === mapping.mapType);
        this.splice(index, 1);
        return this;
    }

    public hasToField(toField: TransactionFields): boolean {
        return this.some(mapping => mapping.toField === toField);
    }
}

export interface IInstitution {
    id: string;
    name: string;
    description: string;
    mappings: InstitutionMappings;
    update(data: IInstitution): Institution;
    addMapping(fromField: string, toField: TransactionFields, mapType: MapTypes): IInstitution;
}

/**
 * Data model object to represent an institution.
 * Coerces a Hash/Object into something we can use as institution to at least typecast the
 * structure as we need it here.
 */
export class Institution implements IInstitution {
    public id: string;
    public name: string;
    public description: string;
    public mappings: InstitutionMappings;

    constructor(id?: string, name?: string, description?: string, mappings?: IMapping[]) {
        this.id          = id || v4();
        this.name        = name || '';
        this.description = description || '';
        this.mappings    = mappings? new InstitutionMappings(...mappings): new InstitutionMappings({fromField: '', toField: 'UNKNOWN', mapType: MapTypes.csv});
    }

    /**
     * Allows upsert updates to this object. Enable ability to update many fields without
     * having to set them all if we don't need to. Also can update by providing this object
     * to itself with overlayed updates.
     * @param {Object} data Data to use to update this object.
     * @returns Institution
     */
    public update(data: IInstitution): Institution {
        data.id && (this.id = data.id);
        data.name && (this.name = data.name);
        data.description && (this.description = data.description);
        data.mappings && (this.mappings = new InstitutionMappings(...data.mappings));
        return this;
    }

    /**
     * Add a mapping to this institution.
     * @returns {Institution} Returns this object for chaining.
     */
    public addMapping(fromField: string, toField: TransactionFields, mapType: MapTypes): IInstitution {
        this.mappings.add(new InstitutionMapping(fromField, toField, mapType));
        return this;
    }
}

/**
 * Extension of an array to give us access to a list of items.
 * Still send an event when saving needs to occur.
 * Ability to find objects by ID and Name.
 * More may come as we find additional use cases for a list/collection.
 */
export class Institutions extends Array<Institution> implements YabaPlural<IInstitution> {

    /**
     * @property {Id2NameHashMap} id2name Convenience mapping of account.id to account.name for quick lookups.
     */
    id2name: Id2NameHashMap = {};

    constructor(...items: IInstitution[]) {
        const id2name: Id2NameHashMap = {};
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item = new Institution();
                if ( false === items[i] instanceof Institution ) {
                    items[i] = item.update(items[i]);
                }
                id2name[item.id] = item.name;
            }
        }
        super(...items);
        this.id2name = id2name;
    }

    /**
     * Add an institution to the list. If the item is not an instance of Institution, it will be coerced into one.
     * @param items 
     * @returns Updated number of items in the list.
     */
    add(...items: IInstitution[]): number {
        for ( const i in items ) {
            const item = <Institution>items[i];
            items[i] instanceof Institution || (items[i] = new Institution(item.id, item.name, item.description, item.mappings));
            this.id2name[item.id] = item.name;
        }
        return super.push(...items);
    }

    /**
     * Removes an item from this collection. Easier to understand than [].splice() since
     * we are using the ID field. Edits the array in place.
     * @param {IInstitution|string} ID The ID field to remove.
     * @returns New Mutated array no longer containing the transaction.
     *   returns itself if no action was taken.
     */
    remove(ID: Institution|string): Institutions {
        const institutionId = (ID instanceof Institution)? ID.id: ID;
        for ( const i in this ) {
            // Skip properties, only iterate over array indexes.
            if ( typeof i !== 'number' ) continue;
            const item = this[i];
            if ( item.id == institutionId ) {
                this.splice(i, 1);
                break;
            }
        }
        return this;
    }

    /**
     * Remove all entries.
     * @return {void}
     */
    clear(): Institutions {
        this.length = 0;
        return this;
    }

    /**
     * Produce a CSV result of the contents of this object.
     * @returns {String} CSV string of the contents of this object.
     * @todo Figure out how to stream results rather than buffering in-memory.
     */
    public toCSV(jszip: JSZip): JSZip {
        if ( this.length == 0 ) {
            return jszip;
        }
        const institutionZIP = ['"id","name","description"'];
        const mappingZIP = ['"institutionId","fromField","toField","mapType"'];
        this.map(institution => {
            const iFields = [institution.id, institution.name, institution.description];
            institutionZIP.push(`"${iFields.join('","')}"`);
            institution.mappings.map(mapping => {
                const mFields = [institution.id, mapping.fromField, mapping.toField, mapping.mapType];
                mappingZIP.push(`"${mFields.join('","')}"`);
            });
        });
        jszip.file('institutions.csv', institutionZIP.join("\n"));
        jszip.file('institution-mappings.csv', mappingZIP.join("\n"));
        return jszip;
    }

    /**
     * If you don't want in-place changes, please use slice() or concat() before calling this method.
     * Input CSV file and result in this object being populated with the contents of previous call to
     * toCSV(JSZip).
     * @mutates
     * @param {JSZip} jsz The JSZip instance that has already loaded the ZIP contents from the end-user.
     * @returns {Promise<Institutions>}
     */
    async fromZIP(jsz: JSZip): Promise<Institutions> {
        interface CsvIMapping extends IMapping {
            institutionId: string;
        }
        this.length = 0; // reset the instance to an empty list.
        const institutionsCSV = await jsz.files['institutions.csv'].async('text'),
            mappingCSV = await jsz.files['institution-mappings.csv'].async('text');
        return new Promise((resolve, reject) => {
            const papaOpts = {
                header: true,
                skipEmptyLines: true
            };
            new Papa().parse(institutionsCSV, {...papaOpts,
                complete: (parsedInstitutions: ParseResult, file?: File|undefined): void => {
                    if (parsedInstitutions.errors.length > 0) {
                        console.error('Failed to parse Institutions CSV file.', file, parsedInstitutions.errors);
                        reject(parsedInstitutions.errors);
                        return;
                    }
                    new Papa().parse(mappingCSV, {...papaOpts,
                        complete: (parsedMappings: ParseResult, file?: File|undefined): void => {
                            if (parsedMappings.errors.length > 0) {
                                console.error('Failed to parse Institution Mappings CSV file.', file, parsedMappings.errors);
                                reject(parsedMappings.errors);
                                return;
                            }
                            this.add(...parsedInstitutions.data);
                            parsedMappings.data.forEach((mappings: CsvIMapping) =>
                                (<IInstitution>this.byId(mappings.institutionId)).mappings.add({
                                    fromField: mappings.fromField,
                                    toField: mappings.toField,
                                    mapType: mappings.mapType
                                })
                            );
                            console.info(`Parsed ${this.length} Institutions from ZIP file for ${this.reduce((a,b) => a += b.mappings.length, 0)} mappings.`);
                            resolve(this);
                        }
                    });
                }
            });
        });
    }

    /**
     * Get an institution by ID.
     * @param {String} ID Institution ID to fetch
     * @returns {Institution}
     */
    byId(ID: string): Institution|undefined {
        return this.filter(i => i.id == ID).shift();
    }

    /**
     * Load up institutions from a stringified JSON object.
     * @param {String} loadString Institutions to load.
     * @returns {Institutions}
     */
    static fromString(loadString: string): Institutions {
        return new Institutions(...JSON.parse(loadString));
    }

    /**
     * Input the File[] set to parse out. From the first file, parse as CSV. Dump the rest.
     * Find the headers from the CSV file and create a mapping for each of them.
     * Return the results as a IMapping[] list.
     * @param {File[]} files Files to parse.
     * @returns {Promise<InstitutionMappings>} Function to handle the results of the CSV file.
     */
    static async csvHandler(files: File[]): Promise<InstitutionMappings> {
        const csvFile = files.shift();
        if ( !csvFile ) {
            return new InstitutionMappings();
        }
        return new Promise((resolve, reject) => {
            const papaOpts: ParseConfig = {
                header: true,
                skipEmptyLines: true,
                complete: (parsedCSV: ParseResult, file?: File|undefined): void => {
                    if (parsedCSV.errors.length > 0) {
                        console.error('Failed to parse CSV file.', file, parsedCSV.errors);
                        reject(parsedCSV.errors);
                    }
                    const headers = Object.keys(parsedCSV.data.shift());
                    const imaps = new InstitutionMappings(...headers.map(h => new InstitutionMapping(h, 'UNKNOWN', MapTypes.csv)));
                    resolve(imaps);
                },
            };
            new Papa().parse(csvFile, papaOpts);
        });
    }
}
