"""
Public Site models: PublicSettings, News, and citizen complaints.
"""
from uuid import uuid4

from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models


class PublicSettings(models.Model):
    """Site-wide settings for the public website."""
    site_name = models.CharField(max_length=255, default='MNA Portal')
    leader_name = models.CharField(max_length=255, blank=True)
    designation = models.CharField(max_length=255, blank=True, help_text='e.g. Member of the National Assembly')
    constituency = models.CharField(max_length=255, blank=True, help_text='e.g. NA-239 Karachi')
    district = models.CharField(max_length=255, blank=True)
    site_message = models.TextField(blank=True, help_text='Main message/tagline for the site')
    hero_statement = models.TextField(blank=True, help_text='Short prominent line used in the hero area')
    intro = models.TextField(blank=True, help_text='Introduction text for landing page')
    intro_image = models.ImageField(upload_to='public/intro/', blank=True, null=True, help_text='Introduction section image')
    vision = models.TextField(blank=True, help_text='Organization vision')
    mission = models.TextField(blank=True, help_text='Organization mission')
    values = models.TextField(blank=True, help_text='Organization values')
    about = models.TextField(blank=True, help_text='About section')
    achievements = models.TextField(blank=True, help_text='Line-separated achievements or focus areas')
    office_address = models.TextField(blank=True)
    office_hours = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    whatsapp = models.CharField(max_length=50, blank=True)
    facebook_url = models.URLField(blank=True)
    x_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    logo = models.FileField(
        upload_to='public/logo/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])],
        help_text='Organization logo',
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Public Settings'
        verbose_name_plural = 'Public Settings'
    
    def __str__(self):
        return 'Public Website Settings'
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and PublicSettings.objects.exists():
            self.pk = PublicSettings.objects.first().pk
        super().save(*args, **kwargs)


class CitizenFeedback(models.Model):
    """Published public feedback/testimonials from citizens."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    quote = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    featured = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return f"{self.name} feedback"


class News(models.Model):
    """News and updates for the public website."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=500)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    excerpt = models.CharField(max_length=500, blank=True, help_text='Short summary shown in listings')
    image = models.ImageField(upload_to='public/news/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    featured = models.BooleanField(default=False, help_text='Show this news prominently')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status', '-published_at']),
        ]
    
    def __str__(self):
        return self.title

class Complaint(models.Model):
    """Public-facing complaints / service requests submitted by citizens."""
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('declined', 'Declined'),
    ]

    tracking_number = models.CharField(max_length=16, unique=True, editable=False)
    name = models.CharField(max_length=255)
    cnic = models.CharField(max_length=30)
    phone = models.CharField(max_length=50)
    category = models.CharField(max_length=120)
    description = models.TextField()
    attachment = models.FileField(upload_to='public/complaints/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    admin_remarks = models.TextField(blank=True)
    admin_attachment = models.FileField(upload_to='public/complaints/admin/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tracking_number']),
            models.Index(fields=['cnic']),
            models.Index(fields=['status', '-created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.tracking_number:
            self.tracking_number = f"CMP-{uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.tracking_number})"


class ComplaintUpdate(models.Model):
    """A dated workflow update added by staff for a complaint."""

    complaint = models.ForeignKey(Complaint, related_name='updates', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Complaint.STATUS_CHOICES)
    comment = models.TextField(blank=True)
    attachment = models.FileField(upload_to='public/complaints/updates/', blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='complaint_updates',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['complaint', '-created_at']),
        ]

    def __str__(self):
        return f"{self.complaint.tracking_number} - {self.status}"
