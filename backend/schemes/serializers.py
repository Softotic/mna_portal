"""
Schemes app serializers.
"""
from rest_framework import serializers
from .models import Scheme, SchemeCategory
from users.serializers import UserSerializer


class SchemeCategorySerializer(serializers.ModelSerializer):
    scheme_count = serializers.SerializerMethodField()

    class Meta:
        model = SchemeCategory
        fields = ['id', 'scheme_id', 'name', 'slug', 'scheme_count', 'created_at']
        read_only_fields = ['id', 'scheme_id', 'slug', 'created_at']

    def get_scheme_count(self, obj):
        return obj.schemes.count()


class SchemeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=SchemeCategory.objects.all(), source='category', write_only=True, required=False
    )
    category_slug = serializers.SlugRelatedField(
        queryset=SchemeCategory.objects.all(), source='category', slug_field='slug', write_only=True, required=True
    )

    class Meta:
        model = Scheme
        fields = [
            'id', 'title', 'description', 'category', 'category_id', 'category_slug',
            'category_name', 'budget', 'status', 'created_by',
            'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'category']

    def to_internal_value(self, data):
        # Create a mutable copy of the data if it isn't already
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy()

        # Ensure category_slug is uppercase for consistent lookup if provided
        if 'category_slug' in data and data['category_slug']:
            data['category_slug'] = data['category_slug'].upper()
        
        # Handle empty budget string from frontend
        if 'budget' in data and data['budget'] == '':
            data['budget'] = '0'

        return super().to_internal_value(data)

    def create(self, validated_data):
        # Double check if category was correctly resolved, if not fallback to 
        # what's in the data directly if the view didn't inject it.
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
