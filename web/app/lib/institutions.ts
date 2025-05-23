import { v4 } from 'uuid';
import * as JSZip from 'jszip';
import { Papa, ParseConfig, ParseResult } from 'ngx-papaparse';

import { Id2NameHashMap, YabaPlural } from 'app/lib/types';
import { ITransaction, Transaction } from 'app/lib/transactions';

/**
 * @enum MapTypes Valid mapping types. To later support function() types as well for things
 * like change the sign and make it negative, perform a regexp replacement on a description or perform
 * some calculation based on related fields in this transaction.
 */
export enum MapTypes {
    value = 'static', // Value is a flat string. No processing needed. Used "value" because "static" is a reserved word.
    dynamic = 'dynamic', // Value is derived from the CSV files.
    function = 'function', // @TODO: Support this
}

/**
 * @interface IMapping Mapping objectlet for Institution().mappings. This has been used enough to make it a real
 */
export interface IMapping {
    fromField: string;
    toField?: keyof ITransaction;
    mapType: MapTypes;
    toString(): string;
}

/**
 * @interface IInstitution Interface for the Institution object.
 */
export interface IInstitution {
    name: string;
    description: string;
    mappings: InstitutionMappings;
}

abstract class aInstitution implements IInstitution {
    abstract id: string;
    abstract name: string;
    abstract description: string;
    abstract mappings: InstitutionMappings;

    abstract update(data: IInstitution): Institution;
    abstract addMapping(fromField: string, toField: keyof Transaction|undefined, mapType: MapTypes): Institution;
}

/**
 * InstitutionMapping objectlet for Institution().mappings. This has been used enough to make it a real
 * thing we can use for importing/exporting and otherwise managing institution mappings.
 */
export class InstitutionMapping implements IMapping {
    fromField = '';
    toField?: keyof ITransaction;
    mapType: MapTypes = MapTypes.value;

    /**
     * @factory Parse a string to build a new mapping.
     * @param {string} loadString JSON String to parse into a mapping.
     * @returns {InstitutionMapping} a freshly loaded object.
     */
    static fromString(loadString: string): InstitutionMapping {
        return InstitutionMapping.fromObject(JSON.parse(loadString));
    }

    /**
     * @factory Parse an object into an instance.
     * @param {IMapping} obj Object to parse.
     * @returns {InstitutionMapping}
     */
    static fromObject(obj: IMapping): InstitutionMapping {
        return new InstitutionMapping().update(obj);
    }

    /**
     * Override for this.toString();
     * @returns {String}
     */
    toString(): string {
        return JSON.stringify({
            fromField: this.fromField,
            toField: this.toField,
            mapType: this.mapType
        });
    }

    /**
     * Refresh this object with new data from an input object that has the same interface and data points.
     * @param {IMapping} obj The data to update.
     * @returns 
     */
    update(obj: IMapping): InstitutionMapping {
        this.fromField = obj.fromField;
        this.toField = obj.toField;
        this.mapType = obj.mapType;
        return this;
    }
}

export class InstitutionMappings extends Array<InstitutionMapping> {

    /**
     * @factory Parse a string to build a new mapping.
     */
    static fromString(loadString: string): InstitutionMappings {
        return InstitutionMappings.fromList(JSON.parse(loadString));
    }

    /**
     * @factory Function to generate a mapping from a list of IMapping.
     * @param {InstitutionMappings|InstitutionMapping[]} list 
     * @returns {InstitutionMappings}
     */
    static fromList(list: InstitutionMapping[]|InstitutionMappings): InstitutionMappings {
        return new InstitutionMappings().add(...list);
    }

    /**
     * Override of the push() function to ensure that each item added to the array is of type `InstitutionMapping`.
     * @param  {...InstitutionMapping|object} items Items to push onto the array.
     * @returns Number of items in the current set/array.
     */
    add(...items: InstitutionMapping[]|InstitutionMappings|IMapping[] ): InstitutionMappings {
        for ( const i in items ) {
            const item = items[i];
            item instanceof InstitutionMapping || (items[i] = InstitutionMapping.fromObject(item));
        }
        super.push(...<InstitutionMapping[]>items);
        return this;
    }

    /**
     * Override for this.toString();
     * @returns {String}
     */
    override toString(): string {
        return JSON.stringify(this);
    }

    /**
     * Remove a mapping from this collection
     * @param {String} fromField Field to remove from the mapping.
     * @returns {InstitutionMappings} Returns this object for chaining..
     */
    removeMapping(mapping: IMapping): InstitutionMappings {
        const index = this.findIndex((item: IMapping) => item.fromField === mapping.fromField && item.toField === mapping.toField && item.mapType === mapping.mapType);
        this.splice(index, 1);
        return this;
    }

    hasToField(toField: keyof Transaction): boolean {
        return this.some(mapping => mapping.toField === toField);
    }
}

/**
 * Data model object to represent an institution.
 * Coerces a Hash/Object into something we can use as institution to at least typecast the
 * structure as we need it here.
 */
export class Institution extends aInstitution implements IInstitution {
    id = v4();
    name = '';
    description = '';
    mappings = new InstitutionMappings();

    /**
     * @factory Parse a string into an object.
     * @param {string} loadString JSON String to parse into an institution.
     * @returns {Institution} a freshly loaded object.
     */
    static fromString(loadString: string): Institution {
        return Institution.fromObject(JSON.parse(loadString));
    }

    /**
     * @factory Parse an object into an instance.
     * @param obj 
     * @returns {Institution}
     */
    static fromObject(obj: IInstitution): Institution {
        return new Institution().update(obj);
    }

    /**
     * Allows upsert updates to this object. Enable ability to update many fields without
     * having to set them all if we don't need to. Also can update by providing this object
     * to itself with overlayed updates.
     * @param {Object} data Data to use to update this object.
     * @returns {Institution}
     */
    update(data: IInstitution): Institution {
        if ( 'id' in data && typeof data.id !== 'undefined' ) {
            this.id = <string>data.id ?? v4();
        }
        this.name = data.name ?? '';
        this.description = data.description ?? '';
        this.mappings = InstitutionMappings.fromList(data.mappings ?? []);
        return this;
    }

    /**
     * Add a mapping to this institution.
     * @returns {Institution} Returns this object for chaining.
     */
    addMapping(fromField: string, toField: keyof ITransaction|undefined, mapType: MapTypes): Institution {
        this.mappings.add(new InstitutionMapping().update({fromField, toField, mapType}));
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

    constructor(...items: IInstitution[]|Institution[]|Institutions) {
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
        super(...items as Institution[]);
        this.id2name = id2name;
    }

    /**
     * Load up institutions from a stringified JSON object.
     * @param {String} loadString Institutions to load.
     * @returns {Institutions}
     */
    static fromString(loadString: string): Institutions {
        try {
            return Institutions.fromList(JSON.parse(loadString));
        } catch(e) {
            console.error('Failed to parse JSON string.', e);
            return new Institutions();
        }
    }

    /**
     * @factory Function to generate an institution from a list of IInstitutions.
     * @param {IInstitution[]|Institutions} list
     * @returns {Institutions}
     */
    static fromList(list: IInstitution[]|Institutions): Institutions {
        const result = new Institutions();
        if ( list instanceof Institutions || list instanceof Array ) {
            result.add(...list);
        }
        return result;
    }

    /**
     * Add an institution to the list. If the item is not an instance of Institution, it will be coerced into one.
     * @param items 
     * @returns Updated number of items in the list.
     */
    add(...items: IInstitution[]|Institution[]|Institutions): Institutions {
        for ( const i in items ) {
            const item = items[i];
            items[i] instanceof Institution || (items[i] = Institution.fromObject(item));
            this.id2name[(<Institution>items[i]).id ?? v4()] = item.name;
        }
        super.push(...items as Institution[]);
        return this;
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
        if ( this.length == 0 ) {
            console.log('No items to remove from Institutions.');
            return this;
        }
        for ( let i = 0, item = this[i]; i < this.length; i++, item = this[i] ) {
            try{
                if ( item.id == institutionId ) {
                    this.splice(i, 1);
                    break;
                }
            } catch (e) {
                console.error('Failed to remove Institution.', e);
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
        this.id2name = {};
        return this;
    }

    /**
     * Check to see if this collection has a transaction by ID.
     */
    has(ID: string|Institution): boolean {
        const institutionId = (ID instanceof Institution)? ID.id: ID;
        return this.some(institution => institution.id == institutionId);
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
     * Produce a CSV result of the contents of this object.
     * @returns {String} CSV string of the contents of this object.
     * @todo Figure out how to stream results rather than buffering in-memory.
     */
    toCSV(jszip: JSZip): JSZip {
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
                                return reject(parsedMappings.errors);
                            }
                            this.add(...parsedInstitutions.data);
                            parsedMappings.data.forEach((mappings: CsvIMapping) => {
                                const inst = this.byId(mappings.institutionId);
                                if ( !inst ) {
                                    console.error(`Institution ID not found for mapping: ${mappings.institutionId}`);
                                    return reject(`Institution ID not found for mapping: ${mappings.institutionId}`);
                                }
                                inst.mappings.add(InstitutionMapping.fromObject(mappings));
                            });
                            console.info(`Parsed ${this.length} Institutions from ZIP file for ${this.reduce((a,b) => a += b.mappings.length, 0)} mappings.`);
                            resolve(this);
                        }
                    });
                }
            });
        });
    }

    /**
     * Input the File[] set to parse out. From the first file, parse as CSV. Dump the rest.
     * Find the headers from the CSV file and create a mapping for each of them.
     * Return the results as a IMapping[] list.
     * @param {File[]} files Files to parse.
     * @returns {Promise<InstitutionMappings>} Function to handle the results of the CSV file.
     */
    static csvHandler(files: File[]): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const csvFile = files.shift();
            if ( !csvFile ) {
                resolve([]);
                return;
            }
            const papaOpts: ParseConfig = {
                header: true,
                skipEmptyLines: true,
                complete: (parsedCSV: ParseResult, file?: File|undefined): void => {
                    if (parsedCSV.errors.length > 0) {
                        console.error('Failed to parse CSV file.', file, parsedCSV.errors);
                        reject(parsedCSV.errors);
                    }
                    const headers = Array.from(Object.keys(parsedCSV.data.shift()));
                    resolve(headers);
                },
            };
            new Papa().parse(csvFile, papaOpts);
        });
    }
}
