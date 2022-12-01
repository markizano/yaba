
import os, io
import unittest
import shutil

DEBUG = 'DEBUG' in os.environ

class TestConfig(unittest.TestCase):

    def setUp(self):
        self.testdir = os.path.realpath( os.path.join(os.path.dirname(__file__), '..', 'workspace') )
        self.oldcwd = os.getcwd()
        self.oldhome = os.environ['HOME']
        if os.path.exists(self.testdir):
            shutil.rmtree(self.testdir)
        os.makedirs(self.testdir, exist_ok=True)
        os.chdir(self.testdir)
        os.environ['HOME'] = self.testdir

    def testConfigurationRead(self):
        '''
        Asserts that we can read a config file as YAML from disk.
        Maybe this is actually a functional test since it writes files.
        '''
        import kizano.utils
        expected = {
            'unittest': {
                'testStr': 'string',
                'testInt': 1,
                'testFloat': 1.1
            }
        }
        cfgfile = os.path.join('.config', 'yaba', 'config.yml')
        os.makedirs(os.path.join('.config', 'yaba'), exist_ok=True)
        kizano.utils.write_yaml(cfgfile, expected)

        from yaba.config import configs
        actual = configs()
        assert expected == actual, 'Failed to load expected configuration.'
        print('done')

    def tearDown(self):
        if not DEBUG:
            shutil.rmtree(self.testdir)
        os.chdir(self.oldcwd)
        os.environ['HOME'] = self.oldhome

print(__name__)