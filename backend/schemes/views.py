"""
Schemes app views.
"""
import logging
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Scheme, Department
from .serializers import SchemeSerializer, DepartmentSerializer
from users.permissions import SchemeModulePermission

logger = logging.getLogger(__name__)


class SchemeViewSet(viewsets.ModelViewSet):
    """CRUD for schemes with RBAC."""
    queryset = Scheme.objects.select_related('department', 'created_by').all()
    serializer_class = SchemeSerializer
    permission_classes = [IsAuthenticated, SchemeModulePermission]
    module_name = 'schemes'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'department']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'budget', 'status', 'created_at']
    ordering = ['-created_at']


class DepartmentViewSet(viewsets.ModelViewSet):
    """CRUD for departments."""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name']
    pagination_class = None
