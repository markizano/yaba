/**
 * Models around Yaba controllers. Tie HTTP calls and data together.
 */
(function(Yaba) {
    'use strict';

    /**
     * Give me the institution mapping and list of transactions As CSV from bank.
     * I'll return back to you a data structure you can use to $upsert the database with transactions
     * mapped to the cannonical model.
     * @param {Yaba.models.Institution} institution The mapped institution to this set of transactions.
     * @param {Yaba.models.Account} account The target account this CSV file has been dropped on.
     * @param {List<Yaba.models.Transaction>} transactions List of transactions/CSV rows as Object from CSV upload.
     */
    function mapInstitution(institution, account, transactions) {
        var results = [];
        institution.mappings.unshift({
            mapType: 'static',
            toField: 'accountId',
            fromField: account.id
        });
        transactions.map((transaction) => {
            var cannonical = {};
            institution.mappings.map((mapping) => {
                switch(mapping.mapType) {
                    case 'static':
                        cannonical[mapping.toField] = mapping.fromField;
                        break;
                    case 'dynamic':
                        cannonical[mapping.toField] = transaction[mapping.fromField];
                        break;
                    default:
                        throw new Exception(`Invalid mapType for institution ${institution.name} ` +
                          `attached to account ${account.id} on transaction ${transaction.id}.`);
                }
            });
            results.push( cannonical );
        });
        return results;
    }

    Yaba.hasOwnProperty('models') || (Yaba.models = {});
    Yaba.models.mapInstitution = mapInstitution;

    return Yaba;
})(Yaba);
