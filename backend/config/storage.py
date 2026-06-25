import mimetypes
import os

from django.core.files.base import ContentFile
from django.core.files.storage import Storage

from vercel.blob import BlobClient
from vercel.blob.errors import BlobNotFoundError


class VercelBlobStorage(Storage):
    def __init__(self, token=None):
        self.token = token or os.environ.get('BLOB_READ_WRITE_TOKEN')
        self.client = BlobClient(token=self.token)

    def _open(self, name, mode='rb'):
        blob = self.client.get(name)
        content = ContentFile(blob.content)
        content.name = name
        return content

    def _save(self, name, content):
        content.open('rb')
        body = content.read()
        content_type = getattr(content, 'content_type', None) or mimetypes.guess_type(name)[0]
        result = self.client.put(
            name,
            body,
            access='public',
            content_type=content_type,
            add_random_suffix=False,
            overwrite=True,
        )
        return result.pathname

    def delete(self, name):
        if not name:
            return
        try:
            self.client.delete(name)
        except BlobNotFoundError:
            return

    def exists(self, name):
        if not name:
            return False
        try:
            self.client.head(name)
            return True
        except BlobNotFoundError:
            return False

    def size(self, name):
        return self.client.head(name).size

    def url(self, name):
        if not name:
            return ''
        if name.startswith('http://') or name.startswith('https://'):
            return name
        return self.client.head(name).url

    def get_available_name(self, name, max_length=None):
        return name if not max_length else name[:max_length]
