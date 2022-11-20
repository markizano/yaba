/**
 * Models around Yaba controllers. Tie HTTP calls and data together.
 */
(function(Yaba) {
    const AccountTypes = [
        'checking',
        'savings',
        'broker',
        'credit',
        'loan',
        'crypto'
    ];
    const EMPTY_Account = {
        id: '',
        name: '',
        description: '',
        accountType: AccountTypes,
        number: 1234567890,
        routing: 0123456,
        interestRate: 0.0,
        interestStrategy: ['simple', 'compound']
    }
    const EMPTY_Institution = {
        name: '', // string
        description: '', // string
        mapping: [
            {
                fromField: '', // string
                toField: '', // string
                mapType: '' // {enum(string)}, one of ['dynamic', 'static'].
            }
        ]
    }

    // Animate the modal open/close operation.
    function showNewAccount() {

    }

    /**
     * Budget page model.
     */
    function budget() {

    }

    /**
     * Model.gotAccounts. Handles after we've received accounts from the server API.
     * @param {Object} accounts Accounts received from the API endpoint.
     * @param {angular.$scope} $scope
     */
    function accounts(accounts, transactions, $scope) {
        $scope.accounts = accounts;
        $scope.accountTypes = AccountTypes;
        $scope.newAccount = showNewAccount;
        $scope.accounts.forEach((account) => {
            Yaba.http.getTransactions(account.id, $http)
              .then(function(response) {
                return Yaba.models.gotTransactions(response.data, $scope)
              }, (response) => Yaba.utils.ajaxError($scope, response));
        });
    }
    class Accounts {
        constructor(services) {
            services.hasOwnProperty('$http') && ( this.http = services.$http );
            services.hasOwnProperty('$scope') && ( this.scope = services.$scope );
        }

        /**
         * Load accounts to be loaded to the form.
         * @returns Object<Institution>
         */
         async load(options={}) {
            var result = {},
              response = await this.http({
                method: 'GET',
                url: '/api/accounts'
            });
            response.data.accounts.forEach((account) => {
                if ( options.hasOwnProperty('withTransactions') && options.withTransactions ) {
                    account.transactions = Transactions({ accountId: account.id });
                }
                result.push(account);
            });
            return result;
        }
    }

    class Institution {
        constructor(services) {
            services.hasOwnProperty('$http') && ( this.http = services.$http );
            services.hasOwnProperty('$scope') && ( this.scope = services.$scope );
        }

        /**
         * Query for an institution, many institutions and get more details in list format.
         * @returns Object<Institution>
         */
        async load() {
            var result = await this.http({
                method: 'GET',
                url: '/api/institutions'
            });
            console.log(result);
            this.scope.institutions = result.data.institutions;
            return this.scope.institutions;
        }

        /**
         * Save an institution to the server.
         * @param {Interface Institution} institution The Institution we are saving to the server.
         * @returns HTTPResponse.
         */
        async save() {
            options = {
                institution: {
                    name: this.scope.institution.name,
                    description: this.scope.institution.description,
                    mappings: []
                }
            };
            this.scope.institution.mappings.forEach( (mapping) => {
                options.institution.mappings.push({
                    fromField: mapping.fromField,
                    toField: mapping.toField,
                    mapType: mapping.mapType
                })
            });
            return await this.http({
                method: 'POST',
                url: '/api/institutions',
                params: options
            });
        }
    }

    /**
     * Model.prospect: In order to prospect transactions and spending.
     */
    function prospect() {

    }

    Object(Yaba).hasOwnProperty('models') || (Yaba.models = {
        gotAccounts: accounts,
        Accounts: Accounts,
        Institution: Institution,
        gotBudget: budget,
        gotProspects: prospect
    });

    return Yaba;
})(Yaba);
