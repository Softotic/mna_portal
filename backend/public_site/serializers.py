"""
Serializers for Public Site.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import PublicSettings, News, Complaint, ComplaintUpdate, CitizenFeedback


class PublicSettingsSerializer(serializers.ModelSerializer):
    """Serializer for public site settings."""
    
    class Meta:
        model = PublicSettings
        fields = [
            'id',
            'site_name',
            'leader_name',
            'designation',
            'constituency',
            'district',
            'site_message',
            'hero_statement',
            'intro',
            'intro_image',
            'vision',
            'mission',
            'values',
            'about',
            'achievements',
            'office_address',
            'office_hours',
            'contact_email',
            'contact_phone',
            'whatsapp',
            'facebook_url',
            'x_url',
            'instagram_url',
            'youtube_url',
            'website_url',
            'logo',
            'created_at',
            'updated_at',
        ]


class CitizenFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CitizenFeedback
        fields = [
            'id',
            'name',
            'location',
            'quote',
            'status',
            'featured',
            'sort_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NewsListSerializer(serializers.ModelSerializer):
    """Serializer for news list view (public)."""
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'image',
            'featured',
            'published_at',
        ]
        read_only_fields = ['id', 'published_at']


class NewsDetailSerializer(serializers.ModelSerializer):
    """Serializer for news detail view (public)."""
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'content',
            'excerpt',
            'image',
            'status',
            'featured',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'published_at', 'created_at', 'updated_at']


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintUpdate
        fields = [
            'id',
            'status',
            'comment',
            'attachment',
            'created_by_name',
            'created_at',
        ]
        read_only_fields = fields

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return ''
        full_name = obj.created_by.get_full_name()
        return full_name or obj.created_by.username


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for complaint submission and tracking."""
    updates = ComplaintUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'tracking_number',
            'name',
            'cnic',
            'phone',
            'category',
            'description',
            'attachment',
            'status',
            'admin_remarks',
            'admin_attachment',
            'updates',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tracking_number', 'status', 'admin_remarks', 'admin_attachment', 'created_at', 'updated_at']


class ComplaintAdminSerializer(serializers.ModelSerializer):
    """Serializer for complaint management in admin panel."""
    updates = ComplaintUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'tracking_number',
            'name',
            'cnic',
            'phone',
            'category',
            'description',
            'attachment',
            'status',
            'admin_remarks',
            'admin_attachment',
            'updates',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tracking_number', 'created_at', 'updated_at']


class NewsAdminSerializer(serializers.ModelSerializer):
    """Serializer for news admin view (full CRUD)."""
    
    def create(self, validated_data):
        if validated_data.get('status') == 'published' and not validated_data.get('published_at'):
            validated_data['published_at'] = timezone.now()
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if validated_data.get('status') == 'published' and not validated_data.get('published_at'):
            validated_data['published_at'] = timezone.now()
        return super().update(instance, validated_data)
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'content',
            'excerpt',
            'image',
            'status',
            'featured',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
