"""
Serializers for Public Site.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import PublicSettings, News


class PublicSettingsSerializer(serializers.ModelSerializer):
    """Serializer for public site settings."""
    
    class Meta:
        model = PublicSettings
        fields = [
            'id',
            'site_name',
            'site_message',
            'intro',
            'intro_image',
            'vision',
            'mission',
            'values',
            'about',
            'logo',
            'created_at',
            'updated_at',
        ]


class NewsListSerializer(serializers.ModelSerializer):
    """Serializer for news list view (public)."""
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
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
            'featured',
            'published_at',
            'created_at',
        ]
        read_only_fields = ['id', 'published_at', 'created_at']


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
