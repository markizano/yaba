
import json
from datetime import datetime
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

    def __getitem__(self, id):
        for txn in self:
            if txn.id == id:
                return txn
        return super().__getitem__(id)

    def jsonable(self):
        return [ x.jsonable() for x in self ]

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

class DataModel(object):
    '''
    Object extension that represents any single object of Transaction, Account or Institution.
    '''

    def __str__(self) -> str:
        return json.dumps(self.jsonable())

    def __repr__(self):
        'For debugging purposes only.'
        return str(self)

    def items(self):
        return self.__dict__.items()

    def jsonable(self):
        '''
        Make this object JSON serializable for returning to CherryPy.
        Return the result.
        '''
        result = {
            'id': self.id,
        }
        for prop in list( self.__dict__.keys() ):
            if prop == self._idField:
                continue
            if prop == '_idField':
                continue
            if prop.startswith('_'):
                prop = prop[1:]
            value = getattr(self, prop)
            if isinstance(value, datetime):
                result[prop] = value.strftime('%FT%R:%S')
                continue
            result[prop] = value
        return result

    @property
    def id(self):
        return getattr(self, self._idField)

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
