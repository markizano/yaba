import { v4 } from 'uuid';
import * as JSZip from 'jszip';
import * as Papa from 'papaparse';
import { TransactionFields } from './transactions';

/**
 * @class Exception to make it clear this is a Yaba exception we are raising.
 * Business logic error for when an institution mapping doesn't add up. Typically
 * this happens when the user uploads a CSV file and the institution mapping doesn't
 * match the fields in the CSV file.
 */
export class InstitutionMappingException extends Error {
    constructor(fromField: TransactionFields, toField: TransactionFields) {
        const txFields = Object.values(TransactionFields);
        super(`Institution Mapping should contain one of` +
            ` "${txFields.join('", "')}". ` +
            `Got "${toField}" when setting "${fromField}"`);
        this.name = this.constructor.name;
    }
}

/**
 * @enum MapTypes Valid mapping types. To later support function() types as well for things
 * like change the sign and make it negative, perform a regexp replacement on a description or perform
 * some calculation based on related fields in this transaction.
 */
export enum MapTypes {
    static = 'static',
    dynamic = 'dynamic',
    // function = 'function' // @TODO: Support this
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
    public override push(...items: IMapping[]|InstitutionMappings ): number {
        for ( const i in items ) {
            const item = items[i];
            item instanceof InstitutionMapping || (items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType));
        }
        return super.push(...items);
    }

    /**
     * Override of unshift() to check if item added is an instance of a InstitutionMapping() or not
     * to ensure we only ever contain a list of InstitutionMappings.
     * @param  {...any} items Any list of arguments of items to add as InstitutionMapping()
     * @returns Number of items unshift()ed.
     */
    public override unshift(...items: InstitutionMapping[]): number {
        for (const i in items) {
            const item = items[i];
            item instanceof InstitutionMapping && (items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType));
        }
        return super.unshift(...items);
    }

    /**
     * Override for this.toString();
     * @returns {String}
     */
    public override toString(): string {
        return JSON.stringify(this);
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

    constructor(id?: string, name?: string, description?: string, mappings?: InstitutionMappings) {
        this.id          = id || v4();
        this.name        = name || '';
        this.description = description || '';
        this.mappings    = mappings? new InstitutionMappings(...mappings): new InstitutionMappings();
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
        this.mappings.push(new InstitutionMapping(fromField, toField, mapType));
        return this;
    }
}

/**
 * Extension of an array to give us access to a list of items.
 * Still send an event when saving needs to occur.
 * Ability to find objects by ID and Name.
 * More may come as we find additional use cases for a list/collection.
 */
export class Institutions extends Array<Institution> {

    public override push(...items: Institution[]): number {
        for ( const i in items ) {
            const item: Institution = <IInstitution>items[i];
            items[i] instanceof Institution || (items[i] = new Institution(item.id, item.name, item.description, item.mappings));
        }
        return super.push(...items);
    }

    public override unshift(...items: IInstitution[]): number {
        for (const i in items) {
            const item = <IInstitution>items[i];
            item instanceof Institution || (items[i] = new Institution(item.id, item.name, item.description, item.mappings));
        }
        return super.unshift(...items);
    }

    /**
     * Removes an item from this collection. Easier to understand than [].splice() since
     * we are using the ID field.
     * @param ID The ID field to remove.
     * @returns New Mutated array no longer containing the transaction.
     *   returns itself if no action was taken.
     */
    public remove(ID: IInstitution|string): Institutions {
        for ( const i in this ) {
            if ( typeof i !== 'number' ) continue;
            const item = this[i];
            if ( ID instanceof Institution && item.id == ID.id ) {
                this.splice(i, 1);
            } else if (typeof ID === 'string' && item.id == ID) {
                this.splice(i, 1);
            }
        }
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
    public async fromZIP(jsz: JSZip): Promise<Institutions> {
        interface CsvIMapping extends IMapping {
            institutionId: string;
        }
        this.length = 0; // reset the instance to an empty list.
        const papaOpts = { header: true, skipEmptyLines: true };
        const institutionsCSV = await jsz.files['institutions.csv'].async('text'),
            mappingCSV = await jsz.files['institution-mappings.csv'].async('text');
        const parsedInstitutions: Papa.ParseResult<IInstitution> = Papa.parse(institutionsCSV, papaOpts);
        const parsedMappings: Papa.ParseResult<CsvIMapping> = Papa.parse(mappingCSV, papaOpts);
        this.push(...parsedInstitutions.data);
        parsedMappings.data.forEach(mappings =>
            (<IInstitution>this.byId(mappings.institutionId)).mappings.push({
                fromField: mappings.fromField,
                toField: mappings.toField,
                mapType: mappings.mapType
            })
        );
        console.info(`Parsed ${this.length} Institutions from CSV file for ${this.map(i => i.mappings.length).reduce((a,b) => a += b, 0)} mappings.`);
        return this;
    }

    /**
     * Get an institution by ID.
     * @param {String} ID Institution ID to fetch
     * @returns {Institution}
     */
    public byId(ID: string): Institution|undefined {
        return this.filter(i => i.id == ID).shift();
    }

    // static csvHandler($scope, $timeout) {
    //     return ($event, results) => {
    //         // only get back the headers from the CSV file.
    //         var headers = Object.keys(results.parsedCSV.data.shift());
    //         $scope.institution.mappings = new InstitutionMappings();
    //         headers.forEach((h) => {
    //             // Store in variable for later use in function return value.
    //             // Also: Assign before appending to the list to ensure we use the index we are
    //             //   setting. (avoids out of index error)
    //             let i = $scope.institution.mappings.length;
    //             $scope.institution.mappings.push({
    //                 fromField: h,
    //                 toField: '',
    //                 mapType: 'dynamic'
    //             });
    //             // Set a timeout to alter the visibility immediately after the element has been
    //             // rendered on the page to enable the animation.
    //             $timeout(() => {
    //                 $scope.institution.mappings[i].show();
    //             }, 100);
    //         });
    //         // Let AngularJS know about this since the papaparser breaks the promise chain.
    //         $scope.$apply();
    //     };
    // }
}