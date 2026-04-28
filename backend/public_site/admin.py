"""
Admin panel configuration for Public Site.
"""
from django.contrib import admin
from .models import PublicSettings, News, Complaint


@admin.register(PublicSettings)
class PublicSettingsAdmin(admin.ModelAdmin):
    """Admin interface for public settings."""
    list_display = ('site_name', 'updated_at')
    fieldsets = (
        ('Site Identity', {
            'fields': ('site_name', 'logo'),
        }),
        ('Content', {
            'fields': ('site_message', 'intro', 'intro_image', 'about'),
        }),
        ('Organization Info', {
            'fields': ('vision', 'mission', 'values'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    """Admin interface for news management."""
    list_display = ('title', 'status', 'featured', 'published_at', 'created_at')
    list_filter = ('status', 'featured', 'published_at', 'created_at')
    search_fields = ('title', 'content', 'excerpt')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'excerpt'),
        }),
        ('Content', {
            'fields': ('content', 'image'),
        }),
        ('Publishing', {
            'fields': ('status', 'featured', 'published_at'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'name', 'cnic', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('tracking_number', 'name', 'cnic', 'description', 'admin_remarks')
    readonly_fields = ('tracking_number', 'created_at', 'updated_at')
    fieldsets = (
        ('Complaint Details', {
            'fields': ('tracking_number', 'name', 'cnic', 'phone', 'category', 'description', 'attachment'),
        }),
        ('Administration', {
            'fields': ('status', 'admin_remarks', 'admin_attachment'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
