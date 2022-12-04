
import json
from yaba.adapters.mdb import MongoDriver
from yaba.models import DataModelCollection, DataModel
from yaba.models.transaction import Transaction, TransactionCollection

class AccountCollection(DataModelCollection):
    '''
    List of transactions we would like to contain, aggregate and summarize for the account.
    '''
    def __init__(self, items):
        for item in items:
            self.append(item)
        return super(list, self).__init__()

    def append(self, item):
        if not isinstance(item, Account):
            item = Account(**item)
        super().append(item)

    @property
    def balance(self) -> float:
        result = 0.0
        for txn in self:
            result += txn.amount
        return result

class Account(DataModel):
    '''
    Account Object.
    Represents an account object. Contains transactions and metadata about the account information.
    '''

    def __init__(self, accountId, **kwargs):
        self._idField           = 'accountId'
        self.accountId          = accountId
        self.routing            = kwargs.get('routing', '')
        self.name               = kwargs.get('name', '')
        self.institutionId      = kwargs.get('institutionId', '')
        self.interestRate       = kwargs.get('interestRate', 0.0)
        self.interestStrategy   = kwargs.get('interestStrategy', 'simple')
        self.accountType        = kwargs.get('accountType', '')
        if 'transactions' in kwargs:
            self.transactions   = TransactionCollection(kwargs['transactions'])

    @property
    def interestRate(self) -> float:
        return self._interestRate
    @interestRate.setter
    def interestRate(self, value):
        if value:
            self._interestRate = float(value)

    @property
    def transactions(self) -> TransactionCollection:
        return self._transactions
    @transactions.setter
    def transactions(self, value):
        if not isinstance(value, TransactionCollection):
            value = TransactionCollection(value)
        self._transactions = value


class AccountsImpl(MongoDriver):
    '''
    This is a mongo implementation where we take a data structure and convert it into
    something the database can injest. The idea here is to incorporate the driver pattern.
    '''
    def __init__(self):
        self.tableId = 'accounts'
        return super().__init__()

    def save(self, accounts: AccountCollection):
        '''
        Write the results to disk via asking MongoDB to insert/update.
        @param accounts (yaba.models.AccountsCollection). The list of accounts we are saving to disk.
        '''
        if not isinstance(accounts, yaba.models.AccountCollection):
            if not isinstance(accounts, list):
                raise ValueError('accounts must be list or AccountCollection')
            accounts = yaba.models.AccountCollection(accounts)
        self.collection().update_many({'_id': '$_id'}, accounts, True)

