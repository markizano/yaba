const Yaba = window.Yaba;
(function(Yaba) {

    /**
     * Developer console.
     */
    function develop($scope, institutions, accounts, Settings) {
        class RandomArray extends Array {
            random() {
                return this[Math.floor(Math.random() * this.length)];
            }
        }
        const seedlist = {};
        seedlist.number = (lower=0, upper=100, dec=2) => {
            // Gimmie a random number no greater than ${upper} as float() with ${dec} number of decimal places.
            const decimals = (value, index) => index? value.slice(0, dec): value;
            return Number((Math.random() * (upper - lower) + lower).toString().split('.').map(decimals).join('.'));
        }
        seedlist.institutions = new RandomArray(
            {name: 'JPMC', description: 'JP Morgan Chase'},
            {name: 'BoA', description: 'Bank of America'},
            {name: 'WF', description: 'Wells Fargo'},
            {name: 'Synchrony', description: 'Synchrony Bank'},
            {name: 'CapOne', description: 'Capital One'},
            {name: 'Fidelity', description: 'Fidelity Checking'},
            {name: 'AmEx', description: 'American Express'},
        );
        seedlist.merchants = new RandomArray(
            'Macys', 'Dillards', 'Banana Republic', 'Gap', 'Old Navy', 'JC Pennys',
            'Nordstrom', 'Nordstrom Rack',
            'Target', 'Walmart', 'Kroger', 'Tom Thumb', 'King Soopers', 'WinnCo Foods',
            'Dollar Tree', 'Dollar General', '99 cent store',
            'Ace Hardware', 'Toms Mechanics',
            'Toyota', 'Honda', 'Chevy', 'RAM', 'Loves', 'Race Track', 'Raceway',
            '7-Eleven', 'Valero', 'BP: Better Petroleum', 'Shell Gas', 'Robinhood'
        );
        seedlist.products = new RandomArray(
            '2% Milk', 'Whole Milk', 'Half and Half', 'Heavy Whipping Cream',
            'Eggs', 'Cheese', 'Lunchmeat', 'Bread', 'Coffee', 'Ice Cream', 'Chips',
            'Pickles', 'Olives', 'Oil change', 'Brake Check', 'Tire Rotation', 'Fleece Shirt',
            'Barbie Doll', 'Ken Doll', `Action Figure #${seedlist.number(0, 10, 0)}`,
            'Sausage', 'Bacon', 'Ham', 'Onion', 'Celery', 'Jeans',
        );
        seedlist.payments = new RandomArray(
            'Mortgage', 'Rent', 'Penalty', 'Credit Card Payment', 'Electric Bill', 'Groceries',
            'Gas', 'Water Bill', 'Internet', 'Cable', 'Tax Return Payments',
            'Auto Insurance', 'Home Insurance', 'Health Insurance',
        );
        seedlist.investments = new RandomArray(
            'Dividends', 'S&P 500', 'QQQ', 'Crypto', 'Real Estate', 'REIT', 'ETF',
            'Bonds', 'T-Bills', 'Gold'
        );
        seedlist.income = new RandomArray('Payroll', 'Income', 'Tips', 'Gifts', 'Sales', 'Dividends', 'Tax Returns');
        seedlist.transactionTypes = new RandomArray('withdraw', 'deposit');
        seedlist.headerTypes = {
            datePending: new RandomArray('Requested Date', 'Date Pending', 'Pending Date', 'Pending'),
            datePosted: new RandomArray('Transaction Date', 'Txn Date', 'Date Posted', 'Posted Date', 'Posted'),
            amount: new RandomArray('Amount', 'amount', 'Cost', 'Debit', 'Credit'),
            description: new RandomArray('Description', 'description', 'Memo', 'Remarks'),
            transactionType: new RandomArray('TxnType', 'Type', 'Transaction Type'),
        };
        seedlist.accountTypes = new RandomArray(...Object.values(Yaba.models.Account.Types));
        seedlist.genInstitution = () => {
            let name, description;
            ((i) => { name = i.name; description = i.description })(seedlist.institutions.random());
            let mappings = [];
            mappings.push({
                fromField: seedlist.headerTypes.datePending.random(),
                toField: 'datePending',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: seedlist.headerTypes.datePosted.random(),
                toField: 'datePosted',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: seedlist.headerTypes.amount.random(),
                toField: 'amount',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: seedlist.headerTypes.description.random(),
                toField: 'description',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: seedlist.headerTypes.transactionType.random(),
                toField: 'transactionType',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: 'USD',
                toField: 'currency',
                mapType: 'static'
            });
            return new Yaba.models.Institution({name, description, mappings});
        };
        seedlist.genAccount = (institutionId=null) => {
            let name, description;
            ((i) => { name = i.name; description = i.description })(seedlist.institutions.random());
            return new Yaba.models.Account({
                id: uuid.v4(),
                institutionId: institutionId,
                name: name,
                description: description,
                accountType: seedlist.accountTypes.random(),
                number: Math.floor(Math.random() * 999999999),
                routing: Math.floor(Math.random() * 99999999),
                interestRate: seedlist.number(0, 5, 2),
                interestStrategy: 'simple',
            });
        };
        seedlist.genTransaction = (accountId=null, o={}) => {
            o.maxAmount = o.maxAmount || 100;
            o.minAmount = o.minAmount || 0;
            o.since = o.since || 31536000000; // 1 year by default.
            let ttype = o.ttype? o.ttype: seedlist.transactionTypes.random(),
              institution = seedlist.institutions.random(),
              amount = seedlist.number(o.minAmount, o.maxAmount, 2),
              datePosted = new Date(new Date() - Math.floor(Math.random() * o.since)),
              datePending = new Date(datePosted - 259200000); // banks usually post in 3 business days.
            switch(ttype) {
                case 'withdraw':
                    switch(o.withdrawType) {
                        case 'sale':
                            // in case of sale of item, like on credit card.
                            let merchant = seedlist.merchants.random();
                            return new Yaba.models.Transaction({
                                id: uuid.v4(),
                                description: `Purchased ${seedlist.products.random()} from ${merchant}.`,
                                accountId: accountId,
                                datePending: datePending,
                                datePosted: datePosted,
                                transactionType: ttype,
                                amount: -amount,
                                tax: amount * 0.09,
                                currency: 'USDC',
                                merchant: merchant,
                                tags: [],
                            });
                        case 'payment':
                            // In case we are making like a credit card payment.
                            // in case of sale of item, like on credit card.
                            let billCollector = seedlist.institutions.random().description;
                            let bill = seedlist.payments.random();
                            return new Yaba.models.Transaction({
                                id: uuid.v4(),
                                description: `Paid on ${bill} from ${billCollector}.`,
                                accountId: accountId,
                                datePending: datePending,
                                datePosted: datePosted,
                                transactionType: ttype,
                                amount: -amount,
                                tax: 0.0,
                                currency: 'USDC',
                                merchant: billCollector,
                                tags: [],
                            });
                    }
                case 'deposit':
                    let payroll = seedlist.income.random();
                    return new Yaba.models.Transaction({
                        id: uuid.v4(),
                        description: `Income ${payroll} from ${institution.description}`,
                        accountId: accountId,
                        datePending: datePending,
                        datePosted: datePosted,
                        transactionType: ttype,
                        amount: amount,
                        tax: 0,
                        currency: 'USDC',
                        merchant: payroll,
                        tags: [],
                    });
            }
        };
        Yaba.seedlist = seedlist;
        $scope.genInstitution = () => {
            $scope.institution = seedlist.genInstitution();
        };
        $scope.genAccount = (institutionId=null) => {
            $scope.account = seedlist.genAccount(institutionId);
        };
        $scope.genTransaction = (accountId=null) => {
            $scope.transaction = seedlist.genTransaction(accountId);
        };
        $scope.institutions = institutions;
        $scope.accounts = accounts;
        $scope.acctType = 'checking';
        $scope.produceCSV = (txnCount=10) => {
            let csvFile = '';
            const map2string = (t) => (m) => t[m.toField] instanceof Date? t[m.toField].toISOShortDate(): t[m.toField];
            let institution = seedlist.genInstitution();
            let account = seedlist.genAccount(institution.id);
            let mapFields = institution.mappings.filter(m => m.mapType == 'dynamic');
            let mapValues = institution.mappings.filter(m => m.mapType == 'static');
            const oneYear = new Date(new Date() - Yaba.models.Settings.TransactionDeltas.days365).setDate(15),
              today = new Date();
            const nextDay = (dt) => {
                const day = dt.getDate();
                if ( day <= 10 ) return 15;
                if ( day > 17 ) return 45;
                if ( day < 30 ) return dt.getMonth() == 1? 28: 30;
                if ( day >= 30 ) return 45;
            }
            switch($scope.acctType) {
                case 'checking':
                    // l=0 is backup break from loop
                    for ( let start = new Date(oneYear), l=0; start <= today && l<=500; start.setDate(nextDay( start )),l++  ) {
                        console.log('payday: ', start.toISOShortDate());
                        account.transactions.push(seedlist.genTransaction(
                            account.id, {
                                ttype: 'deposit',
                                maxAmount: 1200,
                                minAmount: 950
                            }
                        ));
                    }
                    console.log('income txns: ', account.transactions.length);
                    for ( let i=0; i <= seedlist.number(account.transactions.length/2, account.transactions.length, 0); i++ ) {
                        account.transactions.push(seedlist.genTransaction(
                            account.id, {
                                ttype: 'withdraw',
                                withdrawType: 'payment',
                                maxAmount: 300
                            }
                        ));
                    }
                    break;
                case 'savings':
                    for ( let start = new Date(oneYear); start <= today; start.setDate( nextDay(start) )  ) {
                        account.transactions.push(seedlist.genTransaction(
                            account.id, {
                                ttype: 'deposit',
                                maxAmount: 120,
                                minAmount: 90
                            }
                        ));
                    }
                    break;
                case 'credit':
                    for ( let i=0; i <= txnCount; i++ ) {
                        account.transactions.push(seedlist.genTransaction(account.id, {ttype: 'withdraw', withdrawType: 'sale'}));
                    }
                    break;
            }
            account.transactions.sort((a, b) => b.datePosted - a.datePosted);
            csvFile = '"' + mapFields.map(m => m.fromField).join('","') + '"\n"'
              + account.transactions
                .map(t => mapFields.map(map2string(t))
                .join('","') )
                .join('"\n"') + '"';
            $scope.csvfile = csvFile;
        };
        $scope.downloadCSV = () => {
            const csvBlob = new Blob([$scope.csvfile], { type: 'text/csv' } );
            saveAs(csvBlob, 'mock-transactions.csv');
        };

        /**
         * Test/debugging function that will let me probe how much storage is available to the
         * localStorage. I can set a cookie with the max number of bytes permitted and create a
         * pie chart on the results of that calculation.
         */
        $scope.txnLength = localStorage.testtxns.length
        $scope.testStorageLimit = function() {
            class TestTxns extends Yaba.models.Transactions {}
            const txns = new TestTxns()
            const newTxn = () => txns.push({
                id: uuid.v4(),
                currency: 'USD',
                description: '!! Test Transaction !!'.repeat(10),
                merchant: 'Test Merchant',
                amount: 9.99,
                datePosted: new Date(),
                datePending: new Date(),
                accountId: '00000000-0000-0000-00000000',
                transactionType: 'test',
                tags: ['test1', 'test2', 'test3']
            });
            txns.push(...JSON.parse(localStorage.testtxns))
            for ( let i = 0; i <= 1000; i++ ) {
                try{
                    newTxn();
                    txns.store();
                } catch(e) {
                    console.error(e);
                    break;
                }
                $scope.txnLength = localStorage.testtxns.length;
            }

        };
    }
    develop.$inject = ['$scope', 'institutions', 'accounts', 'Settings'];
    Yaba.app.controller('develop', develop);
    return Yaba;
})(Yaba);
