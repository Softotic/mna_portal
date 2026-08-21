from django.apps import AppConfig


class SchemesConfig(AppConfig):
    name = 'schemes'

    def ready(self):
        from . import signals  # noqa: F401
