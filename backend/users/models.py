"""
Users app models: CustomUser, Role, Permission.
"""
import logging
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

logger = logging.getLogger(__name__)


class Permission(models.Model):
    """Granular permission for RBAC."""
    MODULE_CHOICES = [
        ('users', 'User Management'),
        ('schemes', 'Schemes Management'),
    ]
    ACTION_CHOICES = [
        ('add', 'Add'),
        ('edit', 'Edit'),
        ('delete', 'Delete'),
        ('view', 'View'),
    ]

    module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    codename = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ['module', 'action']
        unique_together = ('module', 'action')

    def __str__(self):
        return self.codename

    def save(self, *args, **kwargs):
        if not self.codename:
            self.codename = f"{self.action}_{self.module}"
        if not self.name:
            self.name = f"Can {self.action} {self.module}"
        super().save(*args, **kwargs)


class Role(models.Model):
    """Role with associated permissions."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class CustomUserManager(BaseUserManager):
    """Custom manager for email-based auth."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        logger.info(f"User created: {email}")
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Custom user model with email-based login."""
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    def has_module_permission(self, module, action):
        """Check if user has a specific module+action permission via their role."""
        if self.is_superuser:
            return True
        if not self.role:
            return False
        return self.role.permissions.filter(module=module, action=action).exists()
