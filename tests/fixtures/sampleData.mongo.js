
var yaba = db.getSiblingDB('Yaba'),
  day30 = new Date( (new Date()) - (1000 * 3600 * 24 * 30) ),
  lastWeek = new Date( (new Date()) - (1000 * 3600 * 24 * 7) ),
  yesterday = new Date( (new Date()) - (1000 * 3600 * 24) ),
  today = new Date();
// Sample data

/* Reset previous DB */
yaba.institutions.remove({});
yaba.accounts.remove({});
yaba.transactions.remove({});

// Transaction Date,Post Date,Description,Category,Type,Amount,Memo
yaba.institutions.insert({
    institutionId: '0x01',
    name: 'My Bank',
    description: 'A sample bank with a checking and savings account.',
    mappings: [
        {
            fromField: 'Transaction Date',
            toField: 'datePending',
            mapType: 'dynamic'
        },
        {
            fromField: 'Post Date',
            toField: 'datePosted',
            mapType: 'dynamic'
        },
        {
            fromField: 'Description',
            toField: 'description',
            mapType: 'dynamic'
        },
        {
            fromField: 'Amount',
            toField: 'amount',
            mapType: 'dynamic'
        },
        {
            fromField: 'USD',
            toField: 'currency',
            mapType: 'static'
        }
    ]
});

yaba.institutions.insert({
    institutionId: '0x02',
    name: 'My Credit Card',
    description: 'A sample bank with a credit card account.',
    mappings: [
        {
            fromField: 'Pending Date',
            toField: 'datePending',
            mapType: 'dynamic'
        },
        {
            fromField: 'Post Date',
            toField: 'datePosted',
            mapType: 'dynamic'
        },
        {
            fromField: 'Memo',
            toField: 'description',
            mapType: 'dynamic'
        },
        {
            fromField: 'Amount',
            toField: 'amount',
            mapType: 'dynamic'
        },
        {
            fromField: 'USD',
            toField: 'currency',
            mapType: 'static'
        }
    ]
});

yaba.accounts.insert({
    accountId: '0x0001',
    institutionId: '0x01',
    name: 'My Checking Account',
    description: 'A unit-test-able checking account inserted manually into the DB.',
    type: 'checking',
    balance: 91.83,
    number: '111111111',
    routing: '9999999',
    interestRate: 0.01,
    interestStrategy: 'simple'
});

yaba.accounts.insert({
    accountId: '0x0011',
    institutionId: '0x01',
    name: 'My Savings Account',
    description: 'A unit-test-able savings account inserted manually into the DB.',
    type: 'savings',
    balance: 10.03,
    number: '111111112',
    routing: '9999999',
    interestRate: 0.01,
    interestStrategy: 'simple'
});

yaba.accounts.insert({
    accountId: '0x0020',
    institutionId: '0x02',
    name: 'My Credit Card',
    description: 'A unit-test-able credit card account inserted manually into the DB.',
    type: 'credit',
    balance: -2583.91,
    number: ['4840', '0000', '0000', '5555'].join(''),
    routing: null,
    interestRate: 0.275,
    interestStrategy: 'compound'
});


yaba.transactions.insert({
    transactionId: '4f7739ec-feb5-4e76-9e28-ce2a139f55eb',
    datePosted: new Date( (new Date()) - (1000 * 3600 * 24 * 30) ),
    datePending: new Date( (new Date()) - (1000 * 3600 * 24 * 28) ),
    merchant: 'Google',
    description: 'Google Play Subscription',
    txnType: 'ACH', // ACH, wire, check, debit, credit, refund, fee, tax
    currency: 'USD',
    amount: -10.83,
    accountId: '0x0001',
    tags: [
        'billz', 'luxury', 'media'
    ]
});

yaba.transactions.insert({
    transactionId: '9426417e-95ea-46f3-a2eb-ed96a710c660',
    datePosted: new Date( (new Date()) - (1000 * 3600 * 24 * 7) ),
    datePending: new Date( (new Date()) - (1000 * 3600 * 24 * 5) ),
    merchant: 'Kroger',
    description: 'Kroger store #117',
    txnType: 'swipe',
    currency: 'USD',
    amount: -103.48,
    accountId: '0x0001',
    tags: [
        'billz', 'essential', 'core'
    ]
});

yaba.transactions.insert({
    transactionId: '0c4e0dbd-dba7-4100-82b2-13113542bd66',
    datePosted: new Date( (new Date()) - (1000 * 3600 * 24 * 7) ),
    datePending: new Date( (new Date()) - (1000 * 3600 * 24 * 5) ),
    merchant: 'My Bank',
    description: 'Transfer to Savings',
    txnType: 'ACH',
    currency: 'USD',
    amount: -50.00,
    accountId: '0x0001',
    tags: [
        'savings'
    ]
});

yaba.transactions.insert({
    transactionId: 'c2a4761b-e268-4f7a-8f3a-8fe029b90ade',
    datePosted: new Date( (new Date()) - (1000 * 3600 * 24 * 2) ),
    datePending: new Date( (new Date()) - (1000 * 3600 * 24) ),
    merchant: 'My Bank',
    description: 'Transfer from Savings',
    txnType: 'ACH',
    currency: 'USD',
    amount: 50.00,
    accountId: '0x0011',
    tags: [
        'savings'
    ]
});


yaba.transactions.insert({
    transactionId: '852a953d-1f57-4078-be2e-cd565023b46b',
    datePosted: new Date( (new Date()) - (1000 * 3600 * 24 * 2) ),
    datePending: new Date( (new Date()) - (1000 * 3600 * 24) ),
    merchant: 'My Bank',
    description: 'Paycheque from Job',
    txnType: 'ACH',
    currency: 'USD',
    amount: 1023.54,
    accountId: '0x0001',
    tags: [ 'payroll', 'income' ]
});

