"""Schemes app admin configuration."""
from django.contrib import admin
from .models import Scheme, Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(Scheme)
class SchemeAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'budget', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'department']
    search_fields = ['title', 'description']
