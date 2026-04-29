"""
Complaint model for public-facing complaint management system.
"""
import random
import string
from django.db import models
from django.utils import timezone


def generate_tracking_id():
    """Generate a unique tracking ID like CMP-2026-XXXXXX."""
    year = timezone.now().year
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=6))
    candidate = f"CMP-{year}-{suffix}"
    # Ensure uniqueness
    while Complaint.objects.filter(tracking_id=candidate).exists():
        suffix = ''.join(random.choices(chars, k=6))
        candidate = f"CMP-{year}-{suffix}"
    return candidate


class Complaint(models.Model):
    """Public complaint submitted by citizens."""

    CATEGORY_CHOICES = [
        ('infrastructure', 'Infrastructure'),
        ('education', 'Education'),
        ('health', 'Health'),
        ('water', 'Water & Sanitation'),
        ('electricity', 'Electricity'),
        ('security', 'Security & Law'),
        ('environment', 'Environment'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('denied', 'Denied'),
    ]

    # Auto-generated unique tracking ID
    tracking_id = models.CharField(
        max_length=20, unique=True, blank=True,
        help_text='Auto-generated tracking ID (e.g. CMP-2026-ABC123)'
    )

    # Complainant info
    name = models.CharField(max_length=255, help_text='Full name of complainant')
    cnic = models.CharField(max_length=13, help_text='13-digit CNIC without dashes')
    phone = models.CharField(max_length=20, help_text='Contact phone number')

    # Complaint details
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(help_text='Detailed description of the complaint')
    attachment = models.FileField(
        upload_to='complaints/attachments/',
        blank=True, null=True,
        help_text='Optional attachment (image or PDF, max 5MB)'
    )

    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(
        blank=True,
        help_text='Internal note by admin (visible to citizen when resolved/denied)'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tracking_id']),
            models.Index(fields=['cnic']),
            models.Index(fields=['status', '-created_at']),
        ]
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'

    def __str__(self):
        return f"{self.tracking_id} — {self.name} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            self.tracking_id = generate_tracking_id()
        super().save(*args, **kwargs)
