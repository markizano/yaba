
import re
import json
import dateparser

class TransactionCollection(list):
    '''
    List of transactions we would like to contain, aggregate and summarize for the account.
    '''
    def __init__(self, items):
        for item in items:
            self.append(item)
        return super().__init__(self)

    def append(self, item):
        if not isinstance(item, Transaction):
            item = Transaction(*item)
        return super().append(item)

class Transaction(object):
    '''
    Transaction Object.
    Represents any transaction object.
    Null values are not carried over to __str__() representations.
    '''
    def __init__(self, txnId, fromAccountId, **kwargs):
        self.txnId = txnId
        self.fromAccountId = fromAccountId
        self.toAccountId = kwargs.get('toAccountId', None)
        self.datePending = kwargs.get('datePending', None)
        self.datePosted = kwargs.get('datePosted', None)
        self.amount = kwargs.get('amount', None)
        self.tax = kwargs.get('tax', None)
        self.summary = kwargs.get('summary', None)
        self.remarks = kwargs.get('remarks', None)
        self.tags = kwargs.get('tags', None)

    def __str__(self):
        result = {
            'txnId': self.txnId,
            'fromAccountId': self.fromAccountId,
        }
        for prop in list( self.__dict__.keys() ):
            if prop in ('txnId', 'fromAccountId'):
                continue
            if prop.startswith('_'):
                prop = prop[1:]
            value = getattr(self, prop)
            if value is None:
                continue
            result[prop] = value
        return json.dumps(result, default=str)

    def __repr__(self):
        '''
        For debugging purposes.
        '''
        return str(self)

    @property
    def datePending(self):
        return self._datePending
    @datePending.setter
    def datePending(self, value):
        if isinstance(value, str):
            value = dateparser.parse(value, settings={'TIMEZONE': 'UTC'})
        self._datePending = value

    @property
    def datePosted(self):
        return self._datePosted
    @datePosted.setter
    def datePosted(self, value):
        if isinstance(value, str):
            value = dateparser.parse(value, settings={'TIMEZONE': 'UTC'})
        self._datePosted = value

    @property
    def amount(self):
        return self._amount
    @amount.setter
    def amount(self, value):
        if value:
            self._amount = float(value)

    @property
    def tax(self):
        return self._tax
    @tax.setter
    def tax(self, value):
        if value:
            self._tax = float(value)

    @property
    def summary(self):
        return self._summary
    @summary.setter
    def summary(self, value):
        if value:
            self._summary = re.sub(r'(?:\s{2,})', ' ', value)

    @property
    def description(self):
        return self._description
    @description.setter
    def description(self, value):
        if value:
            self._description = re.sub(r'(?:\s{2,})', ' ', value)
