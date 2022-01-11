# kizfin.plugins

class KizFinPlugin(object):
    '''
    @Interface class for defining instruments required by child derived class.
    '''

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

