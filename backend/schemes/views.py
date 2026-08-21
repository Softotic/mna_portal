"""
Schemes app views.
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.deletion import ProtectedError
from django.db.models import Count, Q
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import SchemeCategory, Scheme, SchemeTemplate, SchemeEntry, SchemeEntryComment, UnionCouncil
from .serializers import (
    SchemeCategorySerializer, SchemeSerializer,
    SchemeTemplateSerializer, SchemeEntrySerializer, SchemeEntryCommentSerializer, UnionCouncilSerializer,
)
from users.permissions import HasModulePermission
from .importers import SchemeImportError, parse_scheme_import

logger = logging.getLogger(__name__)


class CategoryPermissionMixin:
    """Resolve the scheme category before DRF evaluates RBAC permissions."""

    permission_source = None

    def _module_key(self, request, *args, **kwargs):
        category_slug = request.query_params.get('category_slug') or request.data.get('category_slug')
        if category_slug:
            return str(category_slug).upper()

        template_id = request.query_params.get('template_id') or request.data.get('template_id')
        entry_id = request.query_params.get('entry_id') or request.data.get('entry')
        pk = kwargs.get('pk')

        if self.permission_source == 'template':
            template_id = template_id or pk
        elif self.permission_source == 'entry':
            entry_id = entry_id or pk
        elif self.permission_source == 'comment' and pk:
            comment = SchemeEntryComment.objects.select_related('entry__template__category').filter(pk=pk).first()
            return comment.entry.template.category.slug.upper() if comment else None

        if template_id:
            template = SchemeTemplate.objects.select_related('category').filter(pk=template_id).first()
            return template.category.slug.upper() if template else None
        if entry_id:
            entry = SchemeEntry.objects.select_related('template__category').filter(pk=entry_id).first()
            return entry.template.category.slug.upper() if entry else None
        return None

    def initial(self, request, *args, **kwargs):
        module_key = self._module_key(request, *args, **kwargs)
        if module_key:
            setattr(request, 'module_key', module_key)
        super().initial(request, *args, **kwargs)


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
        
        # Give the client a clear response for known category dependencies.
        if Scheme.objects.filter(category=instance).exists() or SchemeTemplate.objects.filter(category=instance).exists():
            return Response(
                {"success": False, "message": "This category cannot be deleted because it has associated schemes or templates."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            # A related record may be created after the checks above. Return a
            # useful client response instead of exposing a database exception.
            return Response(
                {"success": False, "message": "This category cannot be deleted because it has associated schemes or templates."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
    filter_backends = [SearchFilter]
    search_fields = ['name']
    pagination_class = None


class UnionCouncilViewSet(viewsets.ModelViewSet):
    """CRUD for simple Union Council name metadata."""

    queryset = UnionCouncil.objects.all()
    serializer_class = UnionCouncilSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_key = 'UNION_COUNCILS'
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    pagination_class = None

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.scheme_templates.exists():
            return Response(
                {'detail': 'This Union Council is assigned to a scheme and cannot be deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'detail': 'This Union Council is assigned to a scheme and cannot be deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SchemeTemplateViewSet(CategoryPermissionMixin, viewsets.ModelViewSet):
    """CRUD for scheme templates with user-defined fields."""
    queryset = SchemeTemplate.objects.select_related('category', 'created_by', 'union_council').annotate(
        announced_count=Count(
            'entries',
            filter=Q(entries__status=SchemeEntry.STATUS_ANNOUNCED),
        ),
        in_progress_count=Count(
            'entries',
            filter=Q(entries__status=SchemeEntry.STATUS_IN_PROGRESS),
        ),
        awaiting_inauguration_count=Count(
            'entries',
            filter=Q(entries__status=SchemeEntry.STATUS_AWAITING_INAUGURATION),
        ),
        inaugurated_count=Count(
            'entries',
            filter=Q(entries__status=SchemeEntry.STATUS_INAUGURATED),
        ),
    )
    serializer_class = SchemeTemplateSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    permission_source = 'template'
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['title', 'created_at']
    ordering = ['title']

    def get_queryset(self):
        qs = self.queryset
        cat_slug = self.request.query_params.get('category_slug')
        union_council_id = self.request.query_params.get('union_council')
        if cat_slug:
            qs = qs.filter(category__slug=cat_slug.upper())
        if union_council_id:
            qs = qs.filter(union_council_id=union_council_id)
        return qs


class SchemeEntryViewSet(CategoryPermissionMixin, viewsets.ModelViewSet):
    """User-entered scheme data instances for a template."""
    queryset = SchemeEntry.objects.select_related('template', 'created_by').all()
    serializer_class = SchemeEntrySerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    permission_source = 'entry'
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['template', 'status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = self.queryset
        template_id = self.request.query_params.get('template_id')
        if template_id:
            qs = qs.filter(template_id=template_id)
        return qs

    @action(
        detail=False,
        methods=['post'],
        url_path='import-file',
        parser_classes=[MultiPartParser, FormParser],
    )
    def import_file(self, request):
        """Preview or commit entries from an Excel/PDF table."""
        uploaded_file = request.FILES.get('file')
        template_id = request.data.get('template_id')
        should_commit = str(request.data.get('commit', '')).lower() in {'1', 'true', 'yes'}
        default_status = request.data.get('default_status', SchemeEntry.STATUS_ANNOUNCED)
        valid_statuses = {choice[0] for choice in SchemeEntry.STATUS_CHOICES}

        if not uploaded_file:
            return Response({'detail': 'Choose a file to import.'}, status=status.HTTP_400_BAD_REQUEST)
        if not template_id:
            return Response({'detail': 'A scheme template is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if default_status not in valid_statuses:
            return Response({'detail': 'The selected default status is invalid.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            template = SchemeTemplate.objects.get(pk=template_id)
        except (SchemeTemplate.DoesNotExist, ValueError):
            return Response({'detail': 'The selected scheme template was not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            result = parse_scheme_import(uploaded_file, template.field_definitions, default_status)
        except SchemeImportError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if should_commit:
            entries = [
                SchemeEntry(
                    template=template,
                    values=row['values'],
                    status=row['status'],
                    created_by=request.user,
                )
                for row in result['rows']
            ]
            SchemeEntry.objects.bulk_create(entries)
            return Response({'created_count': len(entries)}, status=status.HTTP_201_CREATED)

        return Response({
            'file_name': uploaded_file.name,
            'total_rows': len(result['rows']),
            'matched_headers': result['matched_headers'],
            'unmatched_headers': result['unmatched_headers'],
            'warnings': result['warnings'][:20],
            'preview_rows': result['rows'][:10],
        })



class SchemeEntryCommentViewSet(CategoryPermissionMixin, viewsets.ModelViewSet):
    """Comments on scheme entries."""
    queryset = SchemeEntryComment.objects.select_related("entry", "created_by").all()
    serializer_class = SchemeEntryCommentSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    permission_source = 'comment'
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
