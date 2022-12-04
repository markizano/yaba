
import pymongo
from yaba.config import configs

class MongoDriver:
    '''
    The sole purpose of this class object is to provide a static interface the application may refer for an
    open connection.
    '''
    _connection = None

    def __init__(self):
        self.config = configs()

    def getConnection(self) -> pymongo.MongoClient:
        '''
        Don't connect multiple times to the DB. Connect once and always return the same connection.
        We would be able to get the collection from the DB connection as well.
        '''
        if MongoDriver._connection:
            return MongoDriver._connection
        MongoDriver._connection = pymongo.MongoClient(self.config['mongo.url'])
        return MongoDriver._connection

    @property
    def db(self) -> pymongo.MongoClient:
        '''
        Property to fetch the DB connection static to thos module.
        '''
        dbname = self.config.get('mongo.dbname', 'Yaba')
        return self.getConnection()[dbname]
