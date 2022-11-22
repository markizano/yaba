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
        number: 0,
        routing: 0,
        interestRate: 0.0,
        interestStrategy: ['simple', 'compound']
    }

    const EMPTY_Institution = {
        id: '',
        name: '', // string
        description: '', // string
        mappings: [
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

    class Accounts {
        constructor(services) {
            services.hasOwnProperty('$http') && ( this.$http = services.$http );
            services.hasOwnProperty('$scope') && ( this.$scope = services.$scope );
        }

        /**
         * Load accounts to be loaded to the form.
         * @returns Object<Institution>
         */
        load(options={}) {
            const that = this;
            return this.$http({
                method: 'GET',
                url: '/api/accounts'
            }).then(function(response) {
                that.$scope.accounts = [];
                response.data.accounts.forEach( (account) => {
                    if ( options.hasOwnProperty('withTransactions') && options.withTransactions ) {
                        var transactions = new Transactions({ $scope: account, $http: that.$http });
                        transactions.load({
                            accountId: account.id,
                            fromDate: options.fromDate || '-30 days',
                            toDate: options.toDate || 'today'
                        });
                    }
                    that.$scope.accounts.push(account);
                });
            });
        }

        /**
         * Save an account to the server based on what is in the local scope.
         * @returns null
         */
        save() {
            options = {
                account: {
                    name: this.$scope.account.name,
                    description: this.$scope.account.description,
                    number: this.$scope.account.number,
                    routing: this.$scope.account.routing,
                    institutionId: this.$scope.account.institutionId,
                    interestRate: this.$scope.account.interestRate,
                    interestStrategy: this.$scope.account.interestStrategy
                }
            };
            return this.$http({
                method: 'POST',
                url: '/api/accounts',
                params: options
            })
        }
    }

    class Transactions {
        constructor(services) {
            this.$http = services.$http;
            this.$scope = services.$scope;
        }

        load(query={}) {
            var that = this;
            var options = {
                accountId: query.accountId,
                fromDate: query.fromDate || '-30 days',
                toDate: query.toDate || 'today',
                tags: query.tags || []
            };
            return this.$http({
                method: 'GET',
                url: '/api/transactions',
                params: options
            }).then(function(response) {
                return that.$scope.transactions = response.data.transactions;
            });

        }

        save() {
            var transaction = {
                id: this.$scope.id,
                name: this.$scope.name,
                description: this.$scope.description,
                datePending: this.$scope.datePending,
                datePosted: this.$scope.datePosted,
                amount: this.$scope.amount,
                accountId: this.$scope.accountId,
                tags: ( (tags) => {
                    var result = [];
                    tags.forEach(tag => {
                        result.push(tag);
                    })
                    return result;
                })( this.$scope.tags.split(',') )
            };
            return this.$http({
                method: 'POST',
                url: '/api/transactions',
                params: { transaction: transaction }
            });
        }
    }

    class Institutions {
        constructor(services) {
            this.$http = services.$http;
            this.$scope = services.$scope;
        }

        /**
         * Query for an institution, many institutions and get more details in list format.
         * @returns Object<Institution>
         */
        load() {
            var that = this;
            return this.$http({
                method: 'GET',
                url: '/api/institutions'
            }).then(function(response) {
                return that.$scope.institutions = response.data.institutions;
            });
        }

        /**
         * Save an institution to the server.
         * @param {Interface Institution} institution The Institution we are saving to the server.
         * @returns HTTPResponse.
         */
        save() {
            options = {
                institution: {
                    name: this.$scope.institution.name,
                    description: this.$scope.institution.description,
                    mappings: []
                }
            };
            this.$scope.institution.mappings.forEach( (mapping) => {
                options.institution.mappings.push({
                    fromField: mapping.fromField,
                    toField: mapping.toField,
                    mapType: mapping.mapType
                })
            });
            return this.$http({
                method: 'POST',
                url: '/api/institutions',
                params: options
            });
        }
        
    }

    class Prospect {
        constructor(services) {
            services.hasOwnProperty('$http') && ( this.$http = services.$http );
            services.hasOwnProperty('$scope') && ( this.$scope = services.$scope );
        }

    }

    Yaba.hasOwnProperty('models') || (Yaba.models = {
        AccountTypes: AccountTypes,
        EMPTY_Account: EMPTY_Account,
        EMPTY_Institution: EMPTY_Institution,

        Accounts: Accounts,
        Institutions: Institutions,
        Transactions: Transactions,
        Prospect: Prospect
    });

    return Yaba;
})(Yaba);
