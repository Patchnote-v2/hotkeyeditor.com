"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

# import os
import environ
from pathlib import Path

from django.core.wsgi import get_wsgi_application

environ.Env.read_env(str(Path(__file__).parent / "settings" / "prod.env"),
                     DEBUG='False', ASSETS_DEBUG='False')

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()
