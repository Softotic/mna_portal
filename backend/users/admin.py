"""Users app admin configuration."""
from django.contrib import admin
from .models import CustomUser, Role, Module, RolePermission

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'created_at']
    list_filter = ['is_active', 'role']
    search_fields = ['email', 'name']

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'key']

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ['role', 'module', 'can_view', 'can_create', 'can_edit', 'can_delete']
    list_filter = ['role', 'module']
