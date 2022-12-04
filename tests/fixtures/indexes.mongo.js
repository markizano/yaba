
var admin = db.getSiblingDB('admin');
admin.createRole({
    role: 'Yaba',
    privileges: [{
        resource: {
            cluster: true
        },
        actions: ['listDatabases']
    }],
    roles: [{
        db: 'Yaba',
        role: 'dbAdmin'
    }, {
        db: 'Yaba',
        role: 'readWrite'
    }]
});

var yaba = db.getSiblingDB('Yaba');

yaba.institutions.createIndex({
    institutionId: 1
}, {
    background: true,
    name: 'institution_id'
})

yaba.accounts.createIndex({
    accountId: 1
}, {
    background: true,
    name: 'accounts_accountId'
});
yaba.accounts.createIndex({
    institutionId: 1
}, {
    background: true,
    name: 'accounts_institutionId'
});

yaba.transactions.createIndex({
    transactionId: 1
}, {
    background: true,
    name: 'transactions_id'
});
yaba.transactions.createIndex({
    accountId: 1
}, {
    background: true,
    name: 'transactions_accountId'
});
