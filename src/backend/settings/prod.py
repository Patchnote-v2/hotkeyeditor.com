import logging
import environ
from pathlib import Path

logging.debug("Settings loading: %s" % __file__)

# This will read only MISSING environment variables from a file
# We want to do this before loading any base settings as they may depend on environment
environ.Env.read_env(str(Path(__file__).parent / "prod.env"),
                     DEBUG='False', ASSETS_DEBUG='False')

from .base import *  # noqa

SECRET_KEY = env("SECRET_KEY")

LOGGING['handlers']['file'] = {
    'backupCount': 3,
    'class': 'logging.handlers.RotatingFileHandler',
    'filename': (os.path.join(ROOT_DIR, 'log', 'django.log')),
    'formatter': 'verbose',
    'level': 'DEBUG',
    'maxBytes': 4194304,  # 4MB
}

LOGGING['root']['handlers'].append('file')
