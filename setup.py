#!/usr/bin/env python

import os
import sys
import glob

sys.path.insert(0, os.path.abspath('lib'))
from setuptools import setup

setup(
  name='kizfinance',
  version='2.0',
  description='Kizano Finance App',
  author='Markizano Draconus',
  author_email='markizano@markizano.net',
  license='GNU',
  url='https://blog.markizano.net/',

  setup_requires=['nose'],
  install_requires=['CherryPy'],
  package_dir={'kizfin': 'lib/kizfin'},
  data_files=[
    ('/etc/kizfin', [ 'etc' ]),
    ('/etc/kizfin/jinja', [ 'data/web' ] ),
  ],

  test_suite='tests/unit',

  scripts=glob.glob('bin/*')
)

