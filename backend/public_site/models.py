"""
Public Site models: PublicSettings, News, Update.
"""
from django.db import models
from django.core.files.storage import default_storage
import os


class PublicSettings(models.Model):
    """Site-wide settings for the public website."""
    site_name = models.CharField(max_length=255, default='MNA Portal')
    site_message = models.TextField(blank=True, help_text='Main message/tagline for the site')
    intro = models.TextField(blank=True, help_text='Introduction text for landing page')
    intro_image = models.ImageField(upload_to='public/intro/', blank=True, null=True, help_text='Introduction section image')
    vision = models.TextField(blank=True, help_text='Organization vision')
    mission = models.TextField(blank=True, help_text='Organization mission')
    values = models.TextField(blank=True, help_text='Organization values')
    about = models.TextField(blank=True, help_text='About section')
    logo = models.ImageField(upload_to='public/logo/', blank=True, null=True, help_text='Organization logo')
    
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
