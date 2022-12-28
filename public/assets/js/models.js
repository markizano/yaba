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
     * @param {Yaba.models.Account.id} accountId The target accountId this CSV file has been dropped on.
     * @param {List<Yaba.models.Transaction>} transactions List of transactions/CSV rows as Object from CSV upload.
     */
    function mapInstitution(institution, accountId, transactions) {
        console.log('mapInstitution()', institution);
        var results = [];
        institution.mappings.unshift({
            mapType: 'static',
            toField: 'accountId',
            fromField: accountId
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
                          `attached to account ${accountId} on transaction ${transaction.id}.`);
                }
            });
            results.push( cannonical );
        });
        return results;
    }

    /**
     * This is called twice in each of the account controllers to handle when a file upload is dropped.
     * Avoid copy-paste code.
     * @param {Yaba.models.Institutions} institutions Institutions Model Service.
     * @param {Yaba.models.accounts} accounts Accounts Model Service
     */
    function txnCsvParsed($scope, institutions, accounts) {
        $scope.$on('csvParsed', (event, results) => {
            // Get all the transactions back and fill up the table.
            console.log(results);
            let transactions = Yaba.models.mapInstitution(
                institutions.findById(results.institutionId),
                results.accountId,
                results.parsedCSV.data);
            transactions.forEach((txn) => {
                accounts.findById(results.accountId).transactions.unshift(new Yaba.models.Transaction(txn));
            });
            $scope.$apply();
            accounts.save($scope);
        });
    }

    Yaba.hasOwnProperty('models') || (Yaba.models = {});
    Yaba.models.mapInstitution = mapInstitution;
    Yaba.models.txnCsvParsed = txnCsvParsed;

    return Yaba;
})(Yaba);
