
var yaba = db.getSiblingDB('Yaba'),
  day30 = new Date( (new Date()) - (1000 * 3600 * 24 * 30) ),
  lastWeek = new Date( (new Date()) - (1000 * 3600 * 24 * 7) ),
  yesterday = new Date( (new Date()) - (1000 * 3600 * 24) ),
  today = new Date();

// Sample data
// Transaction Date,Post Date,Description,Category,Type,Amount,Memo
yaba.institutions.insert({
    institutionId: '0x11',
    name: 'JPMC(CC)',
    description: 'JP Morgan Chase Credit Card',
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

yaba.accounts.insert({
    accountId: '0x1001',
    institutionId: '0x11',
    name: 'Hardcode Account',
    description: 'A hardcoded, yet scripted account.',
    number: '111111111',
    routing: '9999999',
    interestRate: 0.01,
    interestStrategy: 'simple'
});

yaba.transactions.insert({
    transactionId: '4f7739ec-feb5-4e76-9e28-ce2a139f55eb',
    datePosted: lastWeek,
    datePending: day30,
    merchant: 'Google',
    description: 'Google Play Subscription',
    txnType: 'ACH', // ACH, wire, check, debit, credit, refund, fee, tax
    currency: 'USD',
    amount: 10.83,
    fromAccount: '0x1001',
    toAccount: '0x1111',
    tags: [
        'billz', 'luxury', 'media'
    ]
});
