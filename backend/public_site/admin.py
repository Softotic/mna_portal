"""
Admin panel configuration for Public Site.
"""
from django.contrib import admin
from .models import (
    PublicSettings,
    News,
    Complaint,
    ComplaintUpdate,
    CitizenFeedback,
    TeamMember,
    PortfolioUnionCouncil,
    PortfolioCategory,
    PortfolioScheme,
    PortfolioSchemeImage,
    NewsImage,
)


@admin.register(PublicSettings)
class PublicSettingsAdmin(admin.ModelAdmin):
    """Admin interface for public settings."""
    list_display = ('site_name', 'updated_at')
    fieldsets = (
        ('Site Identity', {
            'fields': ('site_name', 'leader_name', 'designation', 'constituency', 'district', 'logo'),
        }),
        ('Content', {
            'fields': ('site_message', 'hero_statement', 'intro', 'intro_image', 'about', 'about_image', 'achievements'),
        }),
        ('Organization Info', {
            'fields': ('vision', 'mission', 'values'),
        }),
        ('Public Contact & Socials', {
            'fields': (
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
            ),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


class NewsImageInline(admin.TabularInline):
    model = NewsImage
    extra = 1


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
    inlines = [NewsImageInline]


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'name', 'father_name', 'union_council', 'cnic', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('tracking_number', 'name', 'father_name', 'village', 'union_council', 'cnic', 'department', 'description', 'admin_remarks')
    readonly_fields = ('tracking_number', 'created_at', 'updated_at')
    fieldsets = (
        ('Complaint Details', {
            'fields': (
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
            ),
        }),
        ('Administration', {
            'fields': ('status', 'admin_remarks', 'admin_attachment'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(ComplaintUpdate)
class ComplaintUpdateAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('complaint__tracking_number', 'complaint__name', 'comment')
    readonly_fields = ('created_at',)


@admin.register(CitizenFeedback)
class CitizenFeedbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'status', 'featured', 'sort_order', 'updated_at')
    list_filter = ('status', 'featured')
    search_fields = ('name', 'location', 'quote')
    list_editable = ('status', 'featured', 'sort_order')


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'designation', 'department', 'union_council', 'status', 'featured', 'sort_order', 'updated_at')
    list_filter = ('status', 'featured', 'department', 'union_council')
    search_fields = ('name', 'designation', 'email', 'phone', 'union_council', 'department', 'bio')
    list_editable = ('status', 'featured')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PortfolioUnionCouncil)
class PortfolioUnionCouncilAdmin(admin.ModelAdmin):
    list_display = ('name', 'sort_order', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PortfolioCategory)
class PortfolioCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'union_council', 'sort_order', 'updated_at')
    list_filter = ('union_council',)
    search_fields = ('name', 'description', 'union_council__name')
    readonly_fields = ('created_at', 'updated_at')


class PortfolioSchemeImageInline(admin.TabularInline):
    model = PortfolioSchemeImage
    extra = 1


@admin.register(PortfolioScheme)
class PortfolioSchemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'union_council', 'category', 'status', 'sort_order', 'updated_at')
    list_filter = ('status', 'union_council', 'category')
    search_fields = ('name', 'description', 'tags', 'notes', 'union_council__name', 'category__name')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PortfolioSchemeImageInline]
