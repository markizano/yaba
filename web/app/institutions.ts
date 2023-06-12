
/**
 * @class Exception to make it clear this is a Yaba exception we are raising.
 */
export class InstitutionMappingException extends Error {
    constructor(fromField: string, toField: string) {
        super(`Institution Mapping should contain one of` +
            ` "${TransactionFields.join('", "')}". ` +
            `Got "${toField}" when setting "${fromField}"`);
        this.name = this.constructor.name;
    }
}

/**
 * @class Exception to make it clear this is a Yaba exception we are raising.
 */
export class InstitutionMapTypeException extends Error {
    constructor(fromField: string, toField: string, mapType: string) {
        super(`Institution Map Type should contain one of` +
            ` "${InstitutionMapping.MapTypes.join(", ")}". ` +
            `Got "${mapType}" when setting "${fromField}" to "${toField}"`);
        this.name = this.constructor.name;
    }
}

export class InstitutionUnzipException extends Error {
    constructor(...args: Array<string>) {
        super(...args);
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
    function = 'function' // @TODO: Support this
}

/**
 * InstitutionMapping objectlet for Institution().mappings. This has been used enough to make it a real
 * thing we can use for importing/exporting and otherwise managing institution mappings.
 */
export class InstitutionMapping {
    public fromField: string;
    public toField: string;
    public mapType: MapTypes;

    constructor(fromField: string, toField: string, mapType: MapTypes) {
        if ( toField !== '' && !TransactionFields.includes(toField) ) {
            console.warn('fields: ', fromField, toField, mapType);
            throw new InstitutionMappingException(fromField, toField);
        }
        if ( mapType !== null && !InstitutionMapping.MapTypes.includes(mapType) ) {
            throw new InstitutionMapTypeException(fromField, toField, mapType);
        }
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

export class InstitutionMappings extends Array {
    constructor(...items: Array<InstitutionMapping|number>) {
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item: InstitutionMapping = items[i] as InstitutionMapping;
                if ( item instanceof InstitutionMapping ) {
                    continue
                }
                items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType);
            }
        }
        super(...items);
    }

    /**
     * Override of the push() function to ensure that each item added to the array is of type `InstitutionMapping`.
     * @param  {...InstitutionMapping|object} items Items to push onto the array.
     * @returns Number of items in the current set/array.
     */
    public override push(...items: InstitutionMapping[] ): number {
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
    toString() {
        return JSON.stringify(this);
    }

    /**
     * Handy method to show all in the collection.
     */
    show() {
        this.forEach(i => i.show());
        return this;
    }

    /**
     * Handy method to hide all in the collection.
     */
    hide() {
        this.forEach(i => i.hide());
        return this;
    }
}

export interface IInstitution {
    id: string;
    name: string;
    description: string;
    mappings: InstitutionMappings;
}

/**
 * Data model object to represent an institution.
 * Coerces a Hash/Object into something we can use as institution to at least typecast the
 * structure as we need it here.
 */
export class Institution {
    constructor(data={}) {
        super(['id', 'name', 'description', 'mappings'], 'institution');
        this.id = data.id || uuid.v4();
        this.name = data.name || '';
        this.description = data.description || '';
        this.mappings = data.mappings? new InstitutionMappings(...data.mappings): new InstitutionMappings();
    }

    /**
     * Allows upsert updates to this object. Enable ability to update many fields without
     * having to set them all if we don't need to. Also can update by providing this object
     * to itself with overlayed updates.
     * @param {Object} data Data to use to update this object.
     * @returns Institution
     */
    update(data) {
        data.id && (this.id = data.id);
        data.name && (this.name = data.name);
        data.description && (this.description = data.description);
        data.mappings && (this.mappings = new InstitutionMappings(...data.mappings));
        return this;
    }
}

/**
 * Extension of an array to give us access to a list of items.
 * Still send an event when saving needs to occur.
 * Ability to find objects by ID and Name.
 * More may come as we find additional use cases for a list/collection.
 */
export class Institutions {

    push(...items) {
        for ( let i in items ) {
            let item = items[i];
            item instanceof Institution || (items[i] = new Institution(item));
        }
        return super.push(...items);
    }

    unshift(...items) {
        for (let i in items) {
            let item = items[i];
            item instanceof Institution || (items[i] = new Institution(item));
        }
        return super.unshift(...items);
    }

    /**
     * Produce a CSV result of the contents of this object.
     * @returns {String}
     */
    toCSV(jszip) {
        if ( this.length == 0 ) {
            return jszip;
        }
        let institutionZIP = ['"id","name","description"'];
        let mappingZIP = ['"institutionId","fromField","toField","mapType"'];
        this.map(institution => {
            let iFields = [institution.id, institution.name, institution.description];
            institutionZIP.push(`"${iFields.join('","')}"`);
            institution.mappings.map(mapping => {
                let mFields = [institution.id, mapping.fromField, mapping.toField, mapping.mapType];
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
    async fromZIP(jsz) {
        this.length = 0; // reset the instance to an empty list.
        const papaOpts = { header: true, skipEmptyLines: true };
        let institutionsCSV = await jsz.files['institutions.csv'].async('text'),
            mappingCSV = await jsz.files['institution-mappings.csv'].async('text');
        let parsedInstitutions = Papa.parse(institutionsCSV, papaOpts);
        let parsedMappings = Papa.parse(mappingCSV, papaOpts);
        this.push(...parsedInstitutions.data);
        parsedMappings.data.forEach(mappings =>
            this.byId(mappings.institutionId).mappings.push({
                fromField: mappings.fromField,
                toField: mappings.toField,
                mapType: mappings.mapType
            })
        );
        console.info(`Parsed ${this.length} Institutions from CSV file for ${this.map(i => i.mappings.length).reduce((a,b) => a += b, 0)} mappings.`);
    }

    /**
     * Get an institution by ID.
     * @param {String} ID Institution ID to fetch
     * @returns {Institution}
     */
    byId(ID) {
        return this.filter(i => i.id == ID).shift();
    }

    static csvHandler($scope, $timeout) {
        return ($event, results) => {
            // only get back the headers from the CSV file.
            var headers = Object.keys(results.parsedCSV.data.shift());
            $scope.institution.mappings = new InstitutionMappings();
            headers.forEach((h) => {
                // Store in variable for later use in function return value.
                // Also: Assign before appending to the list to ensure we use the index we are
                //   setting. (avoids out of index error)
                let i = $scope.institution.mappings.length;
                $scope.institution.mappings.push({
                    fromField: h,
                    toField: '',
                    mapType: 'dynamic'
                });
                // Set a timeout to alter the visibility immediately after the element has been
                // rendered on the page to enable the animation.
                $timeout(() => {
                    $scope.institution.mappings[i].show();
                }, 100);
            });
            // Let AngularJS know about this since the papaparser breaks the promise chain.
            $scope.$apply();
        };
    }
}

