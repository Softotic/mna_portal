"""
Django settings for MNA Portal.
"""

import os
from pathlib import Path
from datetime import timedelta
from urllib.parse import parse_qs, urlparse
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-prod-key')


def str_to_bool(value: str) -> bool:
    return str(value).strip().lower() in {'1', 'true', 'yes', 'on'}


def get_env_list(name: str, default: str):
    return [item.strip() for item in os.environ.get(name, default).split(',') if item.strip()]


DEBUG = str_to_bool(os.environ.get('DEBUG', 'False'))
ALLOWED_HOSTS = get_env_list('ALLOWED_HOSTS', '.vercel.app,localhost,127.0.0.1')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    # Local apps
    'users',
    'schemes',
    'public_site',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

def parse_database_url(url: str):
    parsed = urlparse(url)
    scheme = parsed.scheme.split('+', 1)[0]

    if scheme in ('postgres', 'postgresql'):
        engine = 'django.db.backends.postgresql'
    elif scheme == 'mysql':
        engine = 'django.db.backends.mysql'
    elif scheme == 'sqlite':
        engine = 'django.db.backends.sqlite3'
    else:
        raise ImproperlyConfigured(f'Unsupported DATABASE_URL scheme: {scheme}')

    if engine == 'django.db.backends.sqlite3':
        path = parsed.path
        if path in ('', '/'):
            name = ':memory:'
        elif url.startswith('sqlite:////'):
            name = path
        else:
            name = path.lstrip('/')
        return {'ENGINE': engine, 'NAME': name}

    db_config = {
        'ENGINE': engine,
        'NAME': parsed.path.lstrip('/'),
        'USER': parsed.username or '',
        'PASSWORD': parsed.password or '',
        'HOST': parsed.hostname or '',
        'OPTIONS': {k: v[0] for k, v in parse_qs(parsed.query).items()},
    }

    if parsed.port is not None:
        db_config['PORT'] = str(parsed.port)

    return db_config

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': parse_database_url(DATABASE_URL)
    }
else:
    # Fallback for build time when DATABASE_URL is not available
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'users.CustomUser'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Karachi'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
# For Vercel serverless, use simpler storage
if os.environ.get('VERCEL'):
    STATIC_ROOT = '/tmp/staticfiles'
    STATICFILES_STORAGE = 'django.core.files.storage.DefaultStorage'
else:
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
if not os.environ.get('VERCEL') or not os.environ.get('BLOB_READ_WRITE_TOKEN'):
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

if os.environ.get('BLOB_READ_WRITE_TOKEN'):
    STORAGES = {
        'default': {
            'BACKEND': 'config.storage.VercelBlobStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'
            if os.environ.get('VERCEL')
            else 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Settings
CORS_ALLOWED_ORIGINS = get_env_list(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173'
)
CORS_ALLOW_CREDENTIALS = True

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'users': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'schemes': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
