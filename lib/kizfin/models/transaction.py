
class Transaction(object):
    '''
    Transaction Object.
    Represents any transaction object.
    Null values are not carried over to __str__() representations.
    '''
    def __init__(self, txnId, fromAccountId, toAccountId=None, datePending=None, datePosted=None, summary=None, amount=None, tax=None, remarks=None):
        self.txnId = txnId
        self.fromAccountId = fromAccountId
        self.toAccountId = toAccountId
        self.datePending = datePending
        self.datePosted = datePosted
        self.summary = summary
        self.amount = amount
        self.tax = tax
        self.remarks = remarks

    @property
    def datePending(self, value):
        return self._datePending
    @datePending.setter
    def datePending(self, value):
        if isinstance(value, str):
            value = dateparser.parse(value, settings={'TIMEZONE': 'UTC'})
        self._datePending = value

    @property
    def datePosted(self, value):
        return self._datePosted
    @datePosted.setter
    def datePosted(self, value):
        if isinstance(value, str):
            value = dateparser.parse(value, settings={'TIMEZONE': 'UTC'})
        self._datePosted = value

    @property
    def amount(self, value):
        return self._amount
    @amount.setter
    def amount(self, value):
        self._amount = float(value)

    @property
    def tax(self, value):
        return self._tax
    @tax.setter
    def tax(self, value):
        self._tax = float(value)

    @property
    def summary(self, value):
        return self._summary
    @summary.setter
    def summary(self, value):
        self._summary = re.sub(r'(?:\s{2,})', ' ', value)

    @property
    def description(self, value):
        return self._description
    @description.setter
    def description(self, value):
        self._description = re.sub(r'(?:\s{2,})', ' ', value)
