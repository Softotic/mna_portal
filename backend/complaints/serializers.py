"""
Serializers for the Complaint Management System.
"""
import re
from rest_framework import serializers
from .models import Complaint


class ComplaintSubmitSerializer(serializers.ModelSerializer):
    """Serializer for public complaint submission."""

    def validate_cnic(self, value):
        cleaned = re.sub(r'[-\s]', '', value)
        if not re.match(r'^\d{13}$', cleaned):
            raise serializers.ValidationError(
                'CNIC must be exactly 13 digits (dashes optional).'
            )
        return cleaned

    def validate_phone(self, value):
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if not re.match(r'^(\+92|0)\d{10}$', cleaned):
            raise serializers.ValidationError(
                'Enter a valid Pakistani phone number (e.g. 03001234567).'
            )
        return cleaned

    def validate_attachment(self, value):
        if value:
            max_size = 5 * 1024 * 1024  # 5MB
            if value.size > max_size:
                raise serializers.ValidationError('File size must not exceed 5MB.')
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
            if hasattr(value, 'content_type') and value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    'Only images (JPEG, PNG, GIF) and PDF files are allowed.'
                )
        return value

    class Meta:
        model = Complaint
        fields = [
            'name', 'cnic', 'phone', 'category', 'description', 'attachment'
        ]


class ComplaintSubmitResponseSerializer(serializers.ModelSerializer):
    """Response after successful submission — returns tracking ID only."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Complaint
        fields = ['tracking_id', 'name', 'category', 'category_display', 'created_at']
        read_only_fields = fields


class ComplaintTrackSerializer(serializers.ModelSerializer):
    """Public tracking view — limited fields."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    admin_note_visible = serializers.SerializerMethodField()

    def get_admin_note_visible(self, obj):
        """Only show admin note when resolved or denied."""
        if obj.status in ('resolved', 'denied') and obj.admin_note:
            return obj.admin_note
        return None

    class Meta:
        model = Complaint
        fields = [
            'tracking_id',
            'name',
            'category',
            'category_display',
            'status',
            'status_display',
            'admin_note_visible',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class ComplaintAdminListSerializer(serializers.ModelSerializer):
    """Admin list view serializer."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'tracking_id',
            'name',
            'cnic',
            'phone',
            'category',
            'category_display',
            'status',
            'status_display',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tracking_id', 'created_at', 'updated_at']


class ComplaintAdminDetailSerializer(serializers.ModelSerializer):
    """Admin detail/update serializer — full fields including attachment."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'tracking_id',
            'name',
            'cnic',
            'phone',
            'category',
            'category_display',
            'description',
            'attachment',
            'status',
            'status_display',
            'admin_note',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tracking_id', 'created_at', 'updated_at']
