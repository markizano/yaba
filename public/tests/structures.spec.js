

describe('Yaba.models.Accounts', function() {
    const institutionId = '00000000-00000-0000-00000000';
    const accountId = '00000000-00000-0000-00000000';
    const accounts = new Yaba.models.Accounts();

    beforeEach(() => {
        accounts.push({
            id: accountId,
            institutionId: institutionId,
            name: 'Unit Test',
            description: 'A unit testable account',
            accountType: Yaba.models.Account.Types.Checking,
            number: '0123456789',
            routing: '9876543210',
            transactions: [],
        });
    });

    afterEach(() => {
        accounts.clear();
    });

    it('includes(String)', () => {
        expect(accounts.includes(accountId)).toBe(true);
    });

    it('includes(Account)', () => {
        expect(accounts.includes(new Yaba.models.Account({id: accountId}))).toBe(true);
    });

    it('selected(String)', () => {
        expect(accounts.selected(accountId).length).toEqual(1);
    });

    it('selected(Account)', () => {
        let account = new Yaba.models.Account(accounts[0]);
        expect(accounts.selected( account ).length).toEqual(1);
    });

    it('selected(Array)', () => {
        expect(accounts.selected([accountId]).length).toEqual(1);
    });

    it('selected(Accounts)', () => {
        expect(accounts.selected(accounts).length).toEqual(1);
    });

    describe('accounts.Transactions()', () => {
        const _D_ = new Date();
        beforeEach(() => {
            accounts[0].transactions.push({
                accountId: accounts[0].id,
                datePending: new Date(_D_ - 259200000), // 3 days ago
                datePosted: _D_,
                description: 'Groceries, bread at the store.',
                amount: 2.99,
                tax: 0.89,
                currency: 'USD',
                merchant: 'Corner Store',
                tags: ['grocery']
            });
        });

        it('accounts.getTags()', () => {
            expect(accounts.getTags()).toEqual(['grocery']);
        });

        it('accounts.getTransactions(undefined, undefined, undefined, description, undefined, undefined)', () => {
            let actual = accounts.getTransactions(
                undefined,
                undefined,
                undefined,
                'groceries', // should be case-insensitive too!
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
            expect(actual).toBeInstanceOf(Yaba.models.Transactions);
        });

        it('accounts.getTransactions(undefined, undefined, undefined, description="", undefined, undefined)', () => {
            let actual = accounts.getTransactions(
                undefined,
                undefined,
                undefined,
                '', // empty strings should return all restults
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
            expect(actual).toBeInstanceOf(Yaba.models.Transactions);
        });

        it('accounts.getTransactions(undefined, undefined, undefined, undefined, tags=[], undefined)', () => {
            let actual = accounts.getTransactions(
                undefined,
                undefined,
                undefined,
                undefined,
                [],
                undefined
            );
            expect(actual.length).toEqual(1);
            expect(actual).toBeInstanceOf(Yaba.models.Transactions);
        });

        it('accounts.getTransactions(selectedAccount=[String], undefined, undefined, undefined, undefined, undefined)', () => {
            let actual = accounts.getTransactions(
                [accountId],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
            expect(actual).toBeInstanceOf(Yaba.models.Transactions);
        });
        it('accounts.getTransactions(selectedAccount=[Account], undefined, undefined, undefined, undefined, undefined)', () => {
            let actual = accounts.getTransactions(
                [new Yaba.models.Account({id: accountId})],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
            expect(actual).toBeInstanceOf(Yaba.models.Transactions);
        });
        it('accounts.getTransactions(selectedAccount=Accounts, undefined, undefined, undefined, undefined, undefined)', () => {
            let actual = accounts.getTransactions(
                new Yaba.models.Accounts(new Yaba.models.Account({id: accountId})),
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
            expect(actual).toBeInstanceOf(Yaba.models.Transactions);
        });
    
        it('accounts.getTransactions(!selectedAccount, undefined, undefined, undefined, undefined, undefined)', () => {
            let actual = accounts.getTransactions(
                ['invalid-account-id'],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );
            expect(actual.length).toEqual(0);
            expect(actual).toBeInstanceOf(Yaba.models.Transactions);
        });
    
        });
});

describe('Yaba.models.Transactions', function () {
    transactions = new Yaba.models.Transactions(), _D_ = new Date();
    const accountId = '00000000-00000-0000-00000000';

    beforeEach(() => {
        _D_ = new Date();
        transactions.push({
            accountId: accountId,
            datePending: new Date(_D_ - 259200000), // 3 days ago
            datePosted: _D_,
            description: 'Groceries, bread at the store.',
            amount: 2.99,
            tax: 0.89,
            currency: 'USD',
            merchant: 'Corner Store',
            tags: ['grocery']
        });
    });

    afterEach(() => {
        transactions.clear();
    });

    describe('Sorting Operations', function() {
        beforeEach(() => {
            transactions.clear();
            const today = new Date(), yesterday = new Date(today - 84600000), dayBefore = new Date(yesterday - 84600000);
            this.first = new Yaba.models.Transaction({
                accountId: accountId,
                datePending: new Date(today - 259200000), // 3 days ago
                datePosted: today,
                description: 'Transaction of today.',
                amount: 9.99,
                tax: 1.89,
                currency: 'USD',
                merchant: 'UnitTest',
                tags: ['test']
            });
            this.second = new Yaba.models.Transaction({
                accountId: accountId,
                datePending: new Date(yesterday - 259200000), // 3 days ago
                datePosted: yesterday,
                description: 'Transaction of Yesterday.',
                amount: 9.99,
                tax: 1.89,
                currency: 'USD',
                merchant: 'UnitTest',
                tags: ['test']
            });
            this.third = new Yaba.models.Transaction({
                accountId: accountId,
                datePending: new Date(dayBefore - 259200000), // 3 days ago
                datePosted: dayBefore,
                description: 'Transaction of day before yesterday.',
                amount: 9.99,
                tax: 1.89,
                currency: 'USD',
                merchant: 'UnitTest',
                tags: ['test']
            });
        });
        it('sorted(true)', () => {
            transactions.push(this.second);
            transactions.push(this.first);
            transactions.push(this.third);
            let actual = transactions.sorted();
            expect(actual).toEqual(new Yaba.models.Transactions(first, second, third));
    
            let inverted = transactions.sorted(false);
            expect(inverted).toEqual(new Yaba.models.Transactions(third, second, first));
        });
        it('sorted(false)', () => {
            transactions.push(this.second);
            transactions.push(this.first);
            transactions.push(this.third);
            let actual = transactions.sorted(false);
            expect(actual).toEqual(new Yaba.models.Transactions(third, second, first));
        });
    
    });
    it('byAccountId(String)', () => {
        expect(transactions.byAccountId(accountId).length).toEqual(1);
    });
    it('byAccountId(Account)', () => {
        expect(transactions.byAccountId(new Yaba.models.Account({id: accountId})).length).toEqual(1);
    });

    it('filter() instanceof Transaction', () => {
        expect(transactions.filter(x => x)).shift().toBeInstanceOf(Yaba.models.Transaction);
    });

    /**
     * I just needed a way to collapse applyFilters() without describing it separately with this.
     */
    (function() {
        it('applyFilters(fromDate, toDate, undefined, undefined, undefined)', () => {
            let actual = transactions.applyFilters(
                new Date(_D_ - 259200000),
                _D_,
                undefined,
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
        });
        it('applyFilters(!fromDate, !toDate, undefined, undefined, undefined)', () => {
            _D_.setDate(_D_.getDate() - 3);
            let actual = transactions.applyFilters(
                new Date(_D_ - (259200000 * 5)),
                new Date(_D_ - (259200000 * 3)),
                undefined,
                undefined,
                undefined
            );
            expect(actual.length).toEqual(0);
        });
        it('applyFilters(undefined, undefined, description, undefined, undefined)', () => {
            let actual = transactions.applyFilters(
                undefined,
                undefined,
                'groceries', // should be case-insensitive too!
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
        });
        it('applyFilters(undefined, undefined, description="", undefined, undefined)', () => {
            let actual = transactions.applyFilters(
                undefined,
                undefined,
                '', // empty string should return all results too!
                undefined,
                undefined
            );
            expect(actual.length).toEqual(1);
        });
        it('applyFilters(undefined, undefined, !description, undefined, undefined)', () => {
            let actual = transactions.applyFilters(
                undefined,
                undefined,
                'invalid-description',
                undefined,
                undefined
            );
            expect(actual.length).toEqual(0);
        });
        it('applyFilters(undefined, undefined, undefined, tags, undefined)', () => {
            let actual = transactions.applyFilters(
                undefined,
                undefined,
                undefined,
                ['grocery'],
                undefined,
            );
            expect(actual.length).toEqual(1);
        });
        it('applyFilters(undefined, undefined, undefined, tags=[], undefined)', () => {
            let actual = transactions.applyFilters(
                undefined,
                undefined,
                undefined,
                [],
                undefined,
            );
            expect(actual.length).toEqual(1);
        });
        it('applyFilters(undefined, undefined, undefined, !tags, undefined)', () => {
            let actual = transactions.applyFilters(
                undefined,
                undefined,
                undefined,
                ['invalid-tag'],
                undefined,
            );
            expect(actual.length).toEqual(0);
        });
        it('applyFilters(undefined, undefined, undefined, undefined, limit)', () => {
            transactions.push({
                accountId: accountId,
                datePending: new Date(_D_ - 259200000), // 3 days ago
                datePosted: _D_,
                description: 'More groceries at the store.',
                amount: 10.99,
                tax: 1.89,
                currency: 'USD',
                merchant: 'Supermarket',
                tags: ['grocery']
            });

            let actual = transactions.applyFilters(
                undefined,
                undefined,
                undefined,
                undefined,
                1,
            );
            expect(actual.length).toEqual(1);
        });
    })();
});
