"""
Schemes app models: Department, Scheme.
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class SchemeCategory(models.Model):
    """Metadata-driven category module for schemes."""
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    scheme_id = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            # Create a clean SNAKE_CASE slug for permissions & system ID use
            self.slug = slugify(self.name).upper().replace('-', '_')
            
        if not getattr(self, 'scheme_id', None):
            prefix = self.slug[:3].upper() if len(self.slug) >= 3 else self.slug.upper()
            max_id = SchemeCategory.objects.aggregate(models.Max('id'))['id__max'] or 0
            self.scheme_id = f"{prefix}-{max_id + 1:02d}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Scheme(models.Model):
    """Scheme managed by MNA."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        SchemeCategory, on_delete=models.PROTECT, related_name='schemes'
    )
    budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='schemes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class SchemeTemplate(models.Model):
    """A scheme template with user-defined fields."""
    title = models.CharField(max_length=500)
    category = models.ForeignKey(
        SchemeCategory, on_delete=models.PROTECT, related_name='templates'
    )
    field_definitions = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='scheme_templates'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class SchemeEntry(models.Model):
    """An instance of a scheme template with user-supplied values."""
    STATUS_ANNOUNCED = 'announced_not_started'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_AWAITING_INAUGURATION = 'completed_to_be_inaugurated'
    STATUS_INAUGURATED = 'completed_inaugurated'

    STATUS_CHOICES = [
        (STATUS_ANNOUNCED, 'Announced but not started'),
        (STATUS_IN_PROGRESS, 'In progress'),
        (STATUS_AWAITING_INAUGURATION, 'Completed – to be inaugurated'),
        (STATUS_INAUGURATED, 'Completed and inaugurated'),
    ]

    template = models.ForeignKey(
        SchemeTemplate, on_delete=models.CASCADE, related_name='entries'
    )
    values = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=40,
        choices=STATUS_CHOICES,
        default=STATUS_ANNOUNCED,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='scheme_entries'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.template.title} entry {self.id}"


class SchemeEntryComment(models.Model):
    """Comments on scheme entries."""
    entry = models.ForeignKey(
        SchemeEntry, on_delete=models.CASCADE, related_name="comments"
    )
    comment = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name="scheme_entry_comments"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.created_by.name if self.created_by else 'Unknown'} on entry {self.entry.id}"
