
import re
import json
import dateparser
from datetime import datetime
from yaba.models import DataModelCollection, DataModel

class TransactionCollection(DataModelCollection):
    '''
    List of transactions we would like to contain, aggregate and summarize for the account.
    '''
    def __init__(self, items):
        for item in items:
            self.append(item)
        return super(list, self).__init__()

    def append(self, item):
        if not isinstance(item, Transaction):
            item = Transaction(**item)
        super().append(item)

class Transaction(DataModel):
    '''
    Transaction Object.
    Represents any transaction object.
    Null values are not carried over to __str__() representations.
    '''
    DATENULL = dateparser.parse('1970-01-01 00:00:00-00:00')

    def __init__(self, transactionId, **kwargs):
        self._idField = 'transactionId'
        self.transactionId = transactionId
        self.accountId = kwargs.get('accountId', '')
        self.description = kwargs.get('description', '')
        self.datePending = kwargs.get('datePending', Transaction.DATENULL)
        self.datePosted = kwargs.get('datePosted', Transaction.DATENULL)
        self.transactionType = kwargs.get('transactionType', None)
        self.amount = kwargs.get('amount', 0.0)
        self.tax = kwargs.get('tax', 0.0)
        self.currency = kwargs.get('currency', '')
        self.merchant = kwargs.get('merchant', '')
        self.tags = kwargs.get('tags', [])

    @property
    def datePending(self) -> datetime:
        return self._datePending
    @datePending.setter
    def datePending(self, value):
        if isinstance(value, str):
            value = dateparser.parse(value, settings={'TIMEZONE': 'UTC'})
        self._datePending = value

    @property
    def datePosted(self) -> datetime:
        return self._datePosted
    @datePosted.setter
    def datePosted(self, value):
        if isinstance(value, str):
            value = dateparser.parse(value, settings={'TIMEZONE': 'UTC'})
        self._datePosted = value

    @property
    def amount(self) -> float:
        return self._amount
    @amount.setter
    def amount(self, value):
        if value:
            self._amount = float(value)

    @property
    def tax(self) -> float:
        return self._tax
    @tax.setter
    def tax(self, value):
        if value:
            self._tax = float(value)

    @property
    def summary(self) -> str:
        return self._summary
    @summary.setter
    def summary(self, value):
        if value:
            self._summary = re.sub(r'(?:\s{2,})', ' ', value)

    @property
    def description(self) -> str:
        return self._description
    @description.setter
    def description(self, value):
        if value:
            self._description = re.sub(r'(?:\s{2,})', ' ', value)
