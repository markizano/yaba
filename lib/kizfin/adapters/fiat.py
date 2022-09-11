
import re
import csv
import dateparser
from kizfin.logger import getLogger
log = getLogger(__name__)

class FiatFactory(object):
    '''
    Object that represents a fiat account CSV read/write boiler plate base class.
    '''

    def __init__(self):
        # Input config object from parsing main configuration file.
        # Load CSV file into memory.
        # Assign all the values to $this object.
        pass

    @staticmethod
    def factory(csvfile, mapper) -> list:
        '''
        Factory method to injest csv filename and output a canonical model of the
        transaction. Do 1 thing and do it well.
        Don't try to parse anything about the transaction. This method simply maps the values
        and returns a data structure back.
        Creating a transaction via the `new Transaction()` would be where we want to type-cast
        values to their respective data types.
        @param csvfile (string). Path to the CSV file we want to load.
        @param mapper (object). Key-Value pairs of the mapping between CSV Header -> Canonical Model.
            Keys are the CSV headers that match the definition.
            Values are canonical model elements of our transaction.
            Null values means this doens't map to any canonical model elements.
        @return (list) List of objects representing the mapped CSV file.
          Perfect for injestion to a TransactionCollection object.
        '''
        result = []
        with open(csvfile, 'r', encoding='utf-8') as fd:
            reader = csv.DictReader(fd, restkey='null')
            for txn in reader:
                rtxn = {}
                if 'null' == txn:
                    del txn['null']
                for name, value in txn.items():
                    if mapper[name]:
                        rtxn[ mapper[name] ] = value
                result.append(rtxn)
        return result


if __name__ == '__main__':
    import sys, json
    from pprint import pprint
    from kizfin.models.transaction import Transaction
    vyStarCU = {
        "Transaction ID": 'txnId',
        "AccountNumber": 'fromAccountId',
        "AccountAliasName": 'fromAccountName',
        "PostingDate": 'datePosted',
        "TransactionType": None,
        "CheckNumber": None,
        "Description": 'description',
        "Amount": 'amount',
        "RunningBalance": None,
        "Cleansed Transaction Description": None,
        "Note": 'remarks',
        "Merchant Name": 'toAccountId',
        "Category": None
    }
    txns = FiatFactory.factory(sys.argv[1], vyStarCU)
    result = [ Transaction(**txn) for txn in txns ]
    pprint(result)
