"""
Users app models: Module, Role, RolePermission, CustomUser.
"""
import logging
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

logger = logging.getLogger(__name__)


class Module(models.Model):
    """Module representing a section in the application."""
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.key})"


class Role(models.Model):
    """Role associated with user and permissions."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class RolePermission(models.Model):
    """Matrix mapping Role to Module actions."""
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_permissions')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='module_permissions')
    can_view = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        unique_together = ('role', 'module')

    def __str__(self):
        return f"{self.role.name} - {self.module.key}"


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
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, null=True, blank=True, related_name='users')
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

    def has_module_permission(self, module_key, action):
        """Check if user has permission dynamically."""
        if self.is_superuser or (self.role and self.role.name == 'Super Admin'):
            return True
        if not self.role:
            return False
            
        try:
            role_perm = self.role.role_permissions.get(module__key=module_key)
            if action == 'view':
                return role_perm.can_view
            elif action == 'create':
                return role_perm.can_create
            elif action == 'edit':
                return role_perm.can_edit
            elif action == 'delete':
                return role_perm.can_delete
        except RolePermission.DoesNotExist:
            return False
        return False
