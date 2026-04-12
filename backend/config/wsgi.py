"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
import logging

from django.core.wsgi import get_wsgi_application
from django.core.management import execute_from_command_line

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Run migrations and seed data on Vercel startup (only once per process)
_init_run = False

def initialize_database():
    global _init_run
    if _init_run:
        return
    
    if not os.environ.get('VERCEL'):
        _init_run = True
        return
    
    try:
        logger.info("Running Django migrations...")
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        logger.info("Migrations completed successfully")
        
        # Check if database is empty and seed if needed
        try:
            from users.models import CustomUser
            if CustomUser.objects.count() == 0:
                logger.info("Database is empty, seeding initial data...")
                execute_from_command_line(['manage.py', 'seed_data'])
                logger.info("Initial data seeded successfully")
        except Exception as e:
            logger.warning(f"Seeding warning: {str(e)}")
        
        _init_run = True
    except Exception as e:
        logger.warning(f"Database initialization warning: {str(e)}")
        _init_run = True  # Mark as run to avoid repeated attempts

# Initialize application
application = get_wsgi_application()

# Run database initialization after app initialization
try:
    initialize_database()
except Exception as e:
    logger.error(f"Error during database initialization: {str(e)}")
