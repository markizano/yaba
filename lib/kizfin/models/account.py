
import kizfin.adapters.mongo

import kizfin.models.transaction

class Account(object):
    '''
    Account Object.
    Represents an account object. Contains transactions and metadata about the account information.
    '''

    def __init__(self, accountId, **kwargs):
        self.accountId          = accountId
        self.routing            = kwargs.get('routing', None)
        self.name               = kwargs.get('name', None)
        self.institution        = kwargs.get('institution', None)
        self.interestRate       = kwargs.get('interestRate', None)
        self.interestStrategy   = kwargs.get('interestStrategy', None)
        self.accountType        = kwargs.get('accountType', None)
        if 'transactions' in kwargs:
            self.transactions   = TransactionCollection(kwargs['transactions'])

    def __str__(self):
        result = {
            'accountId': self.accountId,
        }
        for prop in list( self.__dict__.keys() ):
            if prop == 'accountId':
                continue
            value = getattr(self, prop)
            if value is None:
                continue
            result[prop] = value
        return json.dumps(result, default=str)

    @property
    def interestRate(self, value):
        return self._interestRate
    @interestRate.setter
    def interestRate(self, value):
        if value:
            self._interestRate = float(value)
    @property
    def transaction(self):
        return self._transaction
    @transaction.setter
    def transaction(self, value):
        if not isinstance(value, kizfin.models.transaction.Transaction):
            value = kizfin.models.transaction.Transaction(*value)
