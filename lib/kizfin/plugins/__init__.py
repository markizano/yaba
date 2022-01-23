# kizfin.plugins

import os
from easydict import EasyDict
from copy import deepcopy as copy

class Txn(EasyDict):
    '''
    Transaction object that makes it easier to access members of a csv.DictReader.readrow().
    '''
    pass

class TxnCollection(list):
    '''
    Array of objects to represent a transaction.
    '''

    def __init__(self, txns, sort_key='timestamp'):
        '''
        Allow setting the transactions on instantiation of this object array.
        '''
        self._sortkey = sort_key
        for txn in txns:
            if isinstance(txn, dict) and not isinstance(txn, Txn):
                txn = Txn(txn)
            self.append(txn)

    def sort(self):
        '''
        Returns a copy of this object with transactions sorted.
        '''
        return super().sort(self, key=key=lambda x: x[self._sortkey])

    def append(self, member):
        '''
        Overload append by ensuring member is of type Txn() not just dict().
        '''
        assert isinstance(member, dict), 'TxnCollection.append(): Only dictionary objects or Txn() derivatives may be appended.'
        if not isinstance(member, Txn):
            member = Txn(member)
        return super().append(self, member)

#@interface
class CsvUnit(object):
    '''
    @Interface class for defining instruments required by child derived class.
    Kizano Finance Plugin.
    This is a CSV Unit object which represents a single CSV unit. The load() and save()
    methods in this class object will enable one to simply load a single file via
    the __init__() arguments.

    Interface requirements:

    - @save(): Takes the contents of this object and commits to storage the contents
        of this object.
    - @load(): Reads from the storage medium and loads up this object with the
        desired data structure.
    '''

    def __init__(self, path):
        super().__init__(self)
        # self.txns: Array of objects
        self.txns = TxnCollection()
        self.path = path
        self.load()

    @abstractmethod
    def load(self):
        '''
        @MustImplement: This method will attempt to read from its source of truth
        and build the object's containing data from that source.
        '''
        raise NotImplementedError('Must define %s.load()' % self.__class__.__name__ )

    @abstractmethod
    def save(self):
        '''
        @MustImplement: This method will attempt to write its contents to its source of truth
        and update tethered object's data source.
        '''
        raise NotImplementedError('Must define %s.save()' % self.__class__.__name__ )

class CsvGroup(list):
    '''
    List extension to enable collecting a group of CSV files and interpreting their
    data from a higher order of operations. A directory is provided via the __init__()
    method and the group of CSV files under that directory are loaded into memory
    as CsvUnit() objects.
    Enables calculations of objects in groups.
    '''

    def __init__(self, path, account=None):
        '''
        Load up the transactions contained in CSV files under the directory provided
        by `path'.
        '''
        assert path, 'CsvGroup(): Please provide a path to load.'
        assert os.path.exists(path), 'CsvGroup(%s): No such directory.' % path
        assert os.path.isdir(path), 'CsvGroup(%s): `path` is not a directory.' % path
        self.path = path
        self.account = account or os.path.basename(path)
        self.load()

    @abstractmethod
    def load(self):
        '''
        @MustImplement: This method will attempt to read from its source of truth
        and build the object's containing data from that source.
        os.walk() the directory provided by `self.path` and attempt to load the
        CSV objects into this object.
        Freedom provided on how to interpret a directory for heirarchial designs.
        '''
        raise NotImplementedError('Must define %s.load()' % self.__class__.__name__ )

    @abstractmethod
    def save(self):
        '''
        @MustImplement: This method will attempt to write its contents to its source of truth
        and update tethered object's data source.
        os.walk() the storage directory and update files according to their in-object
        changes.
        '''
        raise NotImplementedError('Must define %s.save()' % self.__class__.__name__ )


