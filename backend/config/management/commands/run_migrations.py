"""Management command to run migrations."""
from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Run migrations for all apps'

    def handle(self, *args, **options):
        """Run migrate command."""
        try:
            call_command('migrate', verbosity=1)
            self.stdout.write(
                self.style.SUCCESS('Successfully ran migrations')
            )
        except Exception as e:
            self.stderr.write(
                self.style.ERROR(f'Migration failed: {str(e)}')
            )
