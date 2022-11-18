
import csv

class NewAccountAction(object):
    '''
    New Account class actions/controller.
    '''
    def __init__(self, cfg={}):
        self.accountId          = cfg.accountId
        self.routing            = cfg.routing
        self.name               = cfg.name
        self.institution        = cfg.institution
        self.interestRate       = cfg.interestRate
        self.interestStrategy   = cfg.interestStrategy
        self.accountType        = cg.accountType

