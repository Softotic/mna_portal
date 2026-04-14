"""
Schemes app views.
"""
import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import SchemeCategory, Scheme, SchemeTemplate, SchemeEntry, SchemeEntryComment
from .serializers import (
    SchemeCategorySerializer, SchemeSerializer,
    SchemeTemplateSerializer, SchemeEntrySerializer, SchemeEntryCommentSerializer,
)
from users.permissions import SchemeModulePermission, HasModulePermission

logger = logging.getLogger(__name__)


class SchemeViewSet(viewsets.ModelViewSet):
    """CRUD for schemes with dynamic RBAC module isolation via categories."""
    serializer_class = SchemeSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['budget', 'created_at']
    ordering = ['-created_at']

    def initial(self, request, *args, **kwargs):
        # For list and create requests, we enforce the module permission based on the URL context.
        # The frontend will always pass `?category_slug=` for contextual tabs.
        cat_slug = request.query_params.get('category_slug')
        if cat_slug:
            setattr(request, 'module_key', cat_slug.upper())
        elif request.data.get('category_slug'):
            setattr(request, 'module_key', str(request.data.get('category_slug')).upper())
            
        super().initial(request, *args, **kwargs)

    def get_queryset(self):
        qs = Scheme.objects.select_related('category', 'created_by').all()
        # Optionally filter explicitly if the slug is passed
        cat_slug = self.request.query_params.get('category_slug')
        if cat_slug:
            qs = qs.filter(category__slug=cat_slug.upper())
        return qs


class SchemeCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD for SchemeCategory. Contains explicit strict deletion policy ensuring
    no category gets deleted if linked to existing schemes.
    """
    queryset = SchemeCategory.objects.all()
    serializer_class = SchemeCategorySerializer
    permission_classes = [IsAuthenticated, HasModulePermission]

    # Map dynamic module constraints
    def initial(self, request, *args, **kwargs):
        # We enforce view, create, edit, delete against the general module key
        # DRF calls this before dispatch
        setattr(request, 'module_key', 'CATEGORIES')
        super().initial(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check strict constraints constraint
        if Scheme.objects.filter(category=instance).exists() or SchemeTemplate.objects.filter(category=instance).exists():
            return Response(
                {"success": False, "message": "This category cannot be deleted because it has associated schemes or templates."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    filter_backends = [SearchFilter]
    search_fields = ['name']
    pagination_class = None


class SchemeTemplateViewSet(viewsets.ModelViewSet):
    """CRUD for scheme templates with user-defined fields."""
    queryset = SchemeTemplate.objects.select_related('category', 'created_by').all()
    serializer_class = SchemeTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['title', 'created_at']
    ordering = ['title']

    def get_queryset(self):
        qs = self.queryset
        cat_slug = self.request.query_params.get('category_slug')
        if cat_slug:
            qs = qs.filter(category__slug=cat_slug.upper())
        return qs


class SchemeEntryViewSet(viewsets.ModelViewSet):
    """User-entered scheme data instances for a template."""
    queryset = SchemeEntry.objects.select_related('template', 'created_by').all()
    serializer_class = SchemeEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = self.queryset
        template_id = self.request.query_params.get('template_id')
        if template_id:
            qs = qs.filter(template_id=template_id)
        return qs



class SchemeEntryCommentViewSet(viewsets.ModelViewSet):
    """Comments on scheme entries."""
    queryset = SchemeEntryComment.objects.select_related("entry", "created_by").all()
    serializer_class = SchemeEntryCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["entry"]
    ordering_fields = ["created_at"]
    ordering = ["created_at"]

    def get_queryset(self):
        qs = self.queryset
        entry_id = self.request.query_params.get("entry_id")
        if entry_id:
            qs = qs.filter(entry_id=entry_id)
        return qs

