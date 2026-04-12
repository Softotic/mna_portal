"""Schemes app admin configuration."""
from django.contrib import admin
from .models import SchemeCategory, Scheme

@admin.register(SchemeCategory)
class SchemeCategoryAdmin(admin.ModelAdmin):
    list_display = ('scheme_id', 'name', 'slug', 'created_at')
    search_fields = ('name', 'slug', 'scheme_id')

@admin.register(Scheme)
class SchemeAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'budget', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'description']
