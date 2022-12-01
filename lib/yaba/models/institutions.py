
import re
import json
from yaba.models import DataModelCollection, DataModel

class InstitutionCollectionModel(DataModelCollection):
    '''
    List of institutions we would like to contain, aggregate and summarize.
    '''
    def __init__(self, items):
        for item in items:
            self.append(item)
        return super().__init__(self)

class Institution(DataModel):
    '''
    Institution Object.
    Represents an Institution object. The data mapping between the institution CSV and the cannonical model
    of the transaction object in this application.
    '''

    def __init__(self, institutionId, **kwargs):
        self._idField           = 'institutionId'
        self.institutionId      = institutionId
        self.name               = kwargs.get('name', '')
        self.description        = kwargs.get('description', '')
        if 'mappings' in kwargs:
            self.mappings = []
            for fieldMapping in kwargs['mappings']:
                self.mappings.append({
                    'mapType': fieldMapping['mapType'],
                    'fromField': fieldMapping['fromField'],
                    'toField': fieldMapping['toField']
                })

    def __str__(self) -> str:
        result = {
            'institutionId': self.institutionId,
        }
        for prop in list( self.__dict__.keys() ):
            if prop == 'InstitutionId':
                continue
            if prop.startswith('_'):
                prop = prop[1:]
            value = getattr(self, prop)
            if value is None:
                continue
            result[prop] = value
        return json.dumps(result, default=str)

    @property
    def description(self) -> str:
        return self._description
    @description.setter
    def description(self, value):
        if value:
            self._description = re.sub(r'(?:\s{2,})', ' ', value)

