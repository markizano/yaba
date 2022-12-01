
from easydict import EasyDict

class DataModelCollection(list):
    '''
    Collection object to contain a set of things be they Transactions, Accounts or Institutions.
    Extends: list()
    '''

    def __contains__(self, id):
        result = False
        for t in self:
            if id == t.id:
                result = True
                break
        return result

    def __getitem__(self, i):
        for txn in self:
            if txn.id == id:
                return txn
        return super().__getitem__(i)

    def append(self, item):
        if not isinstance(item, __class__):
            item = __class__(**item)
        return super().append(item)

    def insert(index, item):
        if not isinstance(item, __class__):
            item = __class__(**item)
        return super().insert(index, item)

    def save(self) -> list:
        '''
        Call item.save() on each of the items in this collection object.
        '''
        # For now, iterate the list. Later, I'll come find out how to make this a collection-based transaction.
        results = []
        for item in self:
            results.append( item.save() )
        return results

    def load(self) -> list:
        '''
        Call item.load() on each of the items in this collection object.
        '''
        # For now, iterate the list. Later, I'll come find out how to make this a collection-based transaction.
        results = []
        for item in self:
            results.append( item.load() )
        return results

class DataModel(EasyDict):
    '''
    Object extension that represents any single object of Transaction, Account or Institution.
    '''

    @property
    def id(self):
        return self[self._idField]

    # @abstractmethod
    def load(self):
        '''
        Abstract method of loading data.
        '''
        raise NotImplementedError(__class__)

    # @abstractmethod
    def save(self):
        '''
        Abstract method of saving data.
        '''
        raise NotImplementedError(__class__)
