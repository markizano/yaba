
import json
from yaba.models import DataModelCollection, DataModel
from yaba.models.transaction import Transaction, TransactionCollection

class AccountCollectionModel(DataModelCollection):
    '''
    List of transactions we would like to contain, aggregate and summarize for the account.
    '''
    def __init__(self, items):
        for item in items:
            self.append(item)
        return super().__init__(self)

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

    def __str__(self) -> str:
        result = {
            'accountId': self.accountId,
        }
        for prop in list( self.__dict__.keys() ):
            if prop == 'accountId':
                continue
            if prop.startswith('_'):
                prop = prop[1:]
            value = getattr(self, prop)
            if value is None:
                continue
            result[prop] = value
        return json.dumps(result, default=str)

    @property
    def interestRate(self, value) -> float:
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
