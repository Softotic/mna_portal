from pathlib import Path

from django.conf import settings
from django.core.files.base import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Sync committed local media assets into the configured default storage backend.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            action='append',
            dest='sources',
            help='Optional source directory relative to backend/. Can be repeated.',
        )
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Upload files even if they already exist in the target storage.',
        )

    def handle(self, *args, **options):
        storage = settings.STORAGES['default']['BACKEND'] if hasattr(settings, 'STORAGES') and 'default' in settings.STORAGES else ''
        if 'VercelBlobStorage' not in storage:
            raise CommandError('Default storage is not configured for Vercel Blob.')

        default_sources = ['public', 'media']
        source_names = options['sources'] or default_sources
        overwrite = options['overwrite']
        uploaded = 0
        skipped = 0

        for source_name in source_names:
            source_dir = Path(settings.BASE_DIR) / source_name
            if not source_dir.exists():
                self.stdout.write(self.style.WARNING(f'Skipping missing source: {source_dir}'))
                continue

            for path in source_dir.rglob('*'):
                if not path.is_file():
                    continue

                relative_name = path.relative_to(source_dir).as_posix()
                target_name = f'{source_name}/{relative_name}' if source_name != 'media' else relative_name

                if not overwrite and default_storage.exists(target_name):
                    skipped += 1
                    continue

                with path.open('rb') as handle:
                    default_storage.save(target_name, File(handle, name=path.name))
                uploaded += 1

        self.stdout.write(
            self.style.SUCCESS(f'Sync complete. Uploaded {uploaded} file(s), skipped {skipped} existing file(s).')
        )
