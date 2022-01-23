
from datetime import datetime
import kizfin.plugins

class CsvUnitJPMC(kizfin.plugins.CsvUnit):
    '''
    CsvUnit of a JPMC CSV file.
    Load the file's rows into memory and create a transaction data structure that
    can be delivered via a programming interface.
    '''
    def __init__(self, path):
        '''
        @param path (string). Path to the file you want to load into memory.
          The contents of the CSV must be delivered from JP Morgan Chase in the
          export function.
        '''
        # Transaction Date,Post Date,Description,Category,Type,Amount,Memo
        # 01/01/1999,01/01/1999,Payment Thank You - Web,,Payment,9.99,
        super().__init__(self, path, sort_key='Post Date')

    def load(self):
        '''
        Read the contents of a file and load into this object.
        '''
        if self.path:
            with io.open(self.path, 'r') as fd:
                reader = csv.DictReader(fd)
                for txn in reader:
                    self.txns.append({
                      'Transaction Date': datetime.strptime(txn['Transaction Date'], '%m/%d/%Y'),
                      'Post Date': datetime.strptime(txn['Post Date'], '%m/%d/%Y'),
                      'Description': txn['Description'],
                      'Category': txn['Category'],
                      'Type': txn['Type'],
                      'Amount': float(txn['Amount']),
                      'Memo': txn['Memo']
                    })

    def save(self):
        '''
        @readonly
        All changes will be stored in the DB model.
        '''
        raise RuntimeError('%s is a read-only object.' % self)

class CsvGroupJPMC(kizfin.plugins.CsvGroup):
    '''
    Group of CSV files in a directory of CSV files.
    Directory structure is as follows:

        jpmc/
        ├── Slate/
        │   ├── Chase0000_Activity20201203_20210102_20220120.CSV
        │   ├── Chase0000_Activity20210103_20210202_20220120.CSV
        │   ├── ....CSV
        └── Freedom/
            ├── Chase1111_Activity20210124_20210223_20220120.CSV
            └── Chase1111_Activity20211124_20211223_20220120.CSV

    I expect to receive the root of a master directory containing sub-accounts.
    With each institution, there will be a set of transactions per account one
    owns. This will not mutate each of the CSV files, but rather store them
    in this array-group of objects.
    
    This object's scope is the sub-directory containing the account name.
    The account name will be accepted as an __init__() parameter along with the
    data structure that is the CSV files in an array that had previously been
    loaded into CsvUnit derivatives.
    '''

    def load(self):
        for root, dirs, files in os.path.walk(self.path):
            if not files: continue # Skip over directory-only iterations.
            for f in files:
                account = os.path.basename(root)
                txns = CsvUnitJPMC( os.path.join(root, f) )
                self.append({
                  'account': account,
                  'txns': txns
                })

class CsvAccountGroupJPMC(kizfin.plugins.CsvAccountGroup):
    '''
    '''



