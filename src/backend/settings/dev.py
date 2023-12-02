import logging
import environ

logging.debug("Settings loading: %s" % __file__)

# This will read missing environment variables from a file
# We wan to do this before loading a base settings as they may depend on environment
environ.Env.read_env(DEBUG='True')

from .base import *  # noqa

ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
]
