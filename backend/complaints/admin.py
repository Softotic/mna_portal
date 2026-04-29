"""
Django admin configuration for complaints.
"""
from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('tracking_id', 'name', 'cnic', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('tracking_id', 'name', 'cnic', 'phone')
    readonly_fields = ('tracking_id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
