
import os
import kizano.utils

from kizano.logger import getLogger
log = getLogger(__name__)

class ConfigurationManager:
    '''
    Configuration Management object which will help us with loading up the configuration files to control how
    this will behave.
    '''
    _config = None
    CFG_PATHS = [
        '/etc/yaba/config.yml',
        os.path.join(os.environ['HOME'], '.config', 'yaba', 'config.yml')
    ]

    @property
    def config(self):
        'Property to return the current configuration in memory.'
        return self.getConfig()

    def getConfig(self):
        '''
        Search the configuration files and load them into memory if we haven't done so already.
        @return (dict)
        '''
        if ConfigurationManager._config:
            log.debug('Returning config from cache.')
            return ConfigurationManager._config
        result = {}

        for cfgfile in ConfigurationManager.CFG_PATHS:
            if not os.path.exists(cfgfile):
                continue
            log.debug(f'Loading cfg({cfgfile}) file.')
            cfg = kizano.utils.read_yaml(cfgfile) or {}
            result = kizano.utils.dictmerge(result, cfg)

        ConfigurationManager._config = result
        log.info('Configuration loaded!')
        return result

def configs():
    'Module function to return ConfigurationManager()s instance of config.'
    return ConfigurationManager().config
