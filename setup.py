#!/usr/bin/env python3

import io, os, sys
import glob

#sys.path.insert(0, os.path.abspath('lib'))
from setuptools import setup, find_packages

setupopts = {
  'name': 'yaba',
  'version': '3.0',
  'description': 'Yaba: Yet Another Budgeting App',
  'author': 'Markizano Draconus',
  'author_email': 'markizano@markizano.net',
  'license': 'GPLv3',
  'url': 'https://blog.markizano.net/',

  'setup_requires': ['pytest'],
  'install_requires': [ x.strip() for x in io.open('requirements.txt').readlines() ],

  'package_dir': { 'yaba': 'lib/yaba' },
  'packages': find_packages(where='lib'),

  'data_files': [
    ('/etc/yaba', [ 'etc' ]),
    ('/var/lib/yaba', [ 'data' ] ),
    ('/usr/share/yaba/web', [ 'public' ] ),
  ],

  'test_suite': 'tests/runtests.py',
  'entry_points': {
    'console_scripts': [
      'yaba-api=yaba.api:main'
    ]
  },
}

if 'DEBUG' in os.environ:
  from pprint import pprint
  pprint(setupopts)

setup(**setupopts)
