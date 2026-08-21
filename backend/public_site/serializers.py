"""
Serializers for Public Site.
"""
from rest_framework import serializers
from django.utils import timezone
from django.utils.text import slugify
from .models import (
    PublicSettings,
    News,
    Complaint,
    ComplaintUpdate,
    CitizenFeedback,
    TeamMember,
    PortfolioCategory,
    PortfolioScheme,
    PortfolioSchemeImage,
    NewsImage,
)
from schemes.models import UnionCouncil


class SafeFileUrlField(serializers.FileField):
    def to_representation(self, value):
        if not value:
            return ''

        try:
            if not value.name or not value.storage.exists(value.name):
                return ''
            url = value.url
        except Exception:
            return ''

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        return url


class PublicSettingsSerializer(serializers.ModelSerializer):
    """Serializer for public site settings."""
    intro_image = SafeFileUrlField(required=False, allow_null=True)
    about_image = SafeFileUrlField(required=False, allow_null=True)
    logo = SafeFileUrlField(required=False, allow_null=True)

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
            'about_image',
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


class TeamMemberSerializer(serializers.ModelSerializer):
    photo = SafeFileUrlField(required=False, allow_null=True)

    class Meta:
        model = TeamMember
        fields = [
            'id',
            'name',
            'photo',
            'designation',
            'email',
            'phone',
            'union_council',
            'department',
            'bio',
            'status',
            'featured',
            'sort_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'name': {'required': True, 'allow_blank': False},
            'photo': {'required': True, 'allow_null': False},
            'designation': {'required': True, 'allow_blank': False},
            'email': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'union_council': {'required': False, 'allow_blank': True},
            'department': {'required': False, 'allow_blank': True},
            'bio': {'required': False, 'allow_blank': True},
        }


class PortfolioUnionCouncilSerializer(serializers.ModelSerializer):
    category_count = serializers.SerializerMethodField()
    scheme_count = serializers.SerializerMethodField()

    class Meta:
        model = UnionCouncil
        fields = ['id', 'name', 'category_count', 'scheme_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_category_count(self, obj):
        return obj.portfolio_categories.count()

    def get_scheme_count(self, obj):
        return obj.portfolio_schemes.count()


class PortfolioCategorySerializer(serializers.ModelSerializer):
    union_council_name = serializers.CharField(source='union_council.name', read_only=True)
    scheme_count = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioCategory
        fields = [
            'id',
            'union_council',
            'union_council_name',
            'name',
            'description',
            'sort_order',
            'scheme_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_scheme_count(self, obj):
        return obj.schemes.count()


class PortfolioSchemeSerializer(serializers.ModelSerializer):
    image = SafeFileUrlField(required=False, allow_null=True)
    attachment = SafeFileUrlField(required=False, allow_null=True)
    union_council_name = serializers.CharField(source='union_council.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tag_list = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioScheme
        fields = [
            'id',
            'union_council',
            'union_council_name',
            'category',
            'category_name',
            'name',
            'description',
            'status',
            'image',
            'images',
            'attachment',
            'tags',
            'tag_list',
            'notes',
            'sort_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'tag_list']

    def get_tag_list(self, obj):
        return [tag.strip() for tag in (obj.tags or '').split(',') if tag.strip()]

    def get_images(self, obj):
        return [
            {
                'id': item.id,
                'image': SafeFileUrlField(context=self.context).to_representation(item.image),
                'sort_order': item.sort_order,
            }
            for item in obj.images.all()
            if SafeFileUrlField(context=self.context).to_representation(item.image)
        ]

    def validate(self, attrs):
        union_council = attrs.get('union_council') or getattr(self.instance, 'union_council', None)
        category = attrs.get('category') or getattr(self.instance, 'category', None)
        if union_council and category and category.union_council_id != union_council.id:
            raise serializers.ValidationError({'category': 'Category must belong to the selected union council.'})
        return attrs


class NewsListSerializer(serializers.ModelSerializer):
    """Serializer for news list view (public)."""
    image = SafeFileUrlField(required=False, allow_null=True)
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'image',
            'images',
            'featured',
            'published_at',
        ]
        read_only_fields = ['id', 'published_at']

    def get_images(self, obj):
        return [
            {
                'id': item.id,
                'image': SafeFileUrlField(context=self.context).to_representation(item.image),
                'sort_order': item.sort_order,
            }
            for item in obj.images.all()
            if SafeFileUrlField(context=self.context).to_representation(item.image)
        ]


class NewsDetailSerializer(serializers.ModelSerializer):
    """Serializer for news detail view (public)."""
    image = SafeFileUrlField(required=False, allow_null=True)
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'content',
            'excerpt',
            'image',
            'images',
            'status',
            'featured',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'published_at', 'created_at', 'updated_at']

    def get_images(self, obj):
        return [
            {
                'id': item.id,
                'image': SafeFileUrlField(context=self.context).to_representation(item.image),
                'sort_order': item.sort_order,
            }
            for item in obj.images.all()
            if SafeFileUrlField(context=self.context).to_representation(item.image)
        ]


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    attachment = SafeFileUrlField(required=False, allow_null=True)
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
    attachment = SafeFileUrlField(required=False, allow_null=True)
    admin_attachment = SafeFileUrlField(required=False, allow_null=True)
    updates = ComplaintUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'tracking_number',
            'name',
            'father_name',
            'village',
            'union_council',
            'cnic',
            'department',
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
        extra_kwargs = {
            'father_name': {'required': True, 'allow_blank': False},
            'village': {'required': True, 'allow_blank': False},
            'union_council': {'required': True, 'allow_blank': False},
            'department': {'required': False, 'allow_blank': True},
        }


class ComplaintAdminSerializer(serializers.ModelSerializer):
    """Serializer for complaint management in admin panel."""
    attachment = SafeFileUrlField(required=False, allow_null=True)
    admin_attachment = SafeFileUrlField(required=False, allow_null=True)
    updates = ComplaintUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id',
            'tracking_number',
            'name',
            'father_name',
            'village',
            'union_council',
            'cnic',
            'department',
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
    image = SafeFileUrlField(required=False, allow_null=True)
    images = serializers.SerializerMethodField()

    def _build_unique_slug(self, title, requested_slug=''):
        max_length = News._meta.get_field('slug').max_length
        base_slug = (slugify(requested_slug or title) or 'news-update')[:max_length].strip('-') or 'news-update'
        candidate = base_slug
        suffix = 2
        queryset = News.objects.all()
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        while queryset.filter(slug=candidate).exists():
            suffix_text = f'-{suffix}'
            candidate = f'{base_slug[:max_length - len(suffix_text)].strip("-")}{suffix_text}'
            suffix += 1
        return candidate

    def validate(self, attrs):
        title = attrs.get('title') or getattr(self.instance, 'title', '')
        requested_slug = attrs.get('slug') or ''
        if not requested_slug and self.instance:
            requested_slug = self.instance.slug
        attrs['slug'] = self._build_unique_slug(title, requested_slug)
        return attrs
    
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
            'images',
            'status',
            'featured',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True, 'validators': []},
            'content': {'required': False, 'allow_blank': True},
            'image': {'required': False, 'allow_null': True},
        }

    def get_images(self, obj):
        return [{'id': item.id, 'image': item.image.url, 'sort_order': item.sort_order} for item in obj.images.all()]
