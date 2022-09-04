
import kizfin.adapters.mongo

class AccountModel(object):

    def __init__(self, cfg={}):
        self.accountId          = cfg.accountId
        self.routing            = cfg.routing
        self.name               = cfg.name
        self.institution        = cfg.institution
        self.interestRate       = cfg.interestRate
        self.interestStrategy   = cfg.interestStrategy
        self.accountType        = cfg.accountType
