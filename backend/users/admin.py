"""Users app admin configuration."""
from django.contrib import admin
from .models import CustomUser, Role, Permission

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'created_at']
    list_filter = ['is_active', 'role']
    search_fields = ['email', 'name']

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    filter_horizontal = ['permissions']

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['codename', 'module', 'action']
    list_filter = ['module']
