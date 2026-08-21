"""
Users app views: auth, user CRUD, roles, profile, settings, modules.
"""
import logging
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CustomUser, Role, Module
from .serializers import (
    LoginSerializer, UserSerializer, RoleSerializer,
    ChangePasswordSerializer, ProfileSerializer, UserPermissionSerializer,
    ModuleSerializer
)
from .permissions import IsAdminUser
from .serializers import PROTECTED_MODULE_KEYS

logger = logging.getLogger(__name__)

# ─── Auth Views ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate user and return JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    user = authenticate(request, email=email, password=password)

    if user is None:
        return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({'detail': 'Account is deactivated.'}, status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)

    # Build permissions mapping
    perm_serializer = UserPermissionSerializer()
    permissions = perm_serializer.get_permissions(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role.name if user.role else 'Super Admin',
            'is_superuser': user.is_superuser,
            'permissions': permissions,
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except:
        pass
    return Response({'detail': 'Logged out successfully.'})

@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh_view(request):
    refresh_token = request.data.get('refresh')
    try:
        refresh = RefreshToken(refresh_token)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)})
    except:
        return Response({'detail': 'Invalid refresh token.'}, status=401)

# ─── User Management ViewSet ────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.select_related('role').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    module_key = 'USERS'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'role']
    search_fields = ['email', 'name']
    ordering_fields = ['name', 'email', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        self.required_action = 'edit'
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response({'detail': 'Status toggled', 'is_active': user.is_active})

# ─── Role & Module Management ────────────────────────────────────────────────

class RoleViewSet(viewsets.ModelViewSet):
    """CRUD for roles. Strict Admin Only."""
    queryset = Role.objects.prefetch_related('role_permissions__module').all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [SearchFilter]
    search_fields = ['name']
    pagination_class = None

    def perform_update(self, serializer):
        if serializer.instance.name == 'Super Admin':
            serializer.save(name='Super Admin')
            return
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.name == 'Super Admin':
            return Response(
                {"detail": "The Super Admin role is system-managed and cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if role.users.exists():
            return Response(
                {"detail": "Cannot delete role because it is assigned to users."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class ModuleListView(generics.ListAPIView):
    """List all available modules."""
    queryset = Module.objects.exclude(key__in=PROTECTED_MODULE_KEYS)
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = None

# ─── Profile & Settings ─────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    if request.method == 'GET':
        return Response(ProfileSerializer(user).data)
    serializer = ProfileSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({'old_password': ['Current password incorrect.']}, status=400)
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'detail': 'Password changed.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_permissions_view(request):
    return Response(UserPermissionSerializer().get_permissions(request.user))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    from django.db.models import Count
    from schemes.models import SchemeCategory, SchemeEntry
    from public_site.models import (
        CitizenFeedback, Complaint, News, PortfolioScheme, TeamMember,
    )

    scheme_statuses = {
        row['status']: row['count']
        for row in SchemeEntry.objects.values('status').annotate(count=Count('id'))
    }
    categories = list(
        SchemeCategory.objects.annotate(scheme_count=Count('templates__entries'))
        .values('name', 'scheme_count')
        .order_by('-scheme_count', 'name')[:6]
    )
    complaint_statuses = {
        row['status']: row['count']
        for row in Complaint.objects.values('status').annotate(count=Count('id'))
    }
    return Response({
        'total_users': CustomUser.objects.count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'total_schemes': SchemeEntry.objects.count(),
        'announced_schemes': scheme_statuses.get(SchemeEntry.STATUS_ANNOUNCED, 0),
        'in_progress_schemes': scheme_statuses.get(SchemeEntry.STATUS_IN_PROGRESS, 0),
        'awaiting_inauguration_schemes': scheme_statuses.get(SchemeEntry.STATUS_AWAITING_INAUGURATION, 0),
        'inaugurated_schemes': scheme_statuses.get(SchemeEntry.STATUS_INAUGURATED, 0),
        'total_roles': Role.objects.count(),
        'categories': categories,
        'scheme_statuses': scheme_statuses,
        'complaints': {
            'total': Complaint.objects.count(),
            'open': complaint_statuses.get('submitted', 0) + complaint_statuses.get('in_progress', 0),
            'resolved': complaint_statuses.get('resolved', 0),
            'in_progress': complaint_statuses.get('in_progress', 0),
        },
        'publishing': {
            'news_published': News.objects.filter(status='published').count(),
            'news_drafts': News.objects.filter(status='draft').count(),
            'feedback_published': CitizenFeedback.objects.filter(status='published').count(),
            'team_published': TeamMember.objects.filter(status='published').count(),
            'portfolio_ongoing': PortfolioScheme.objects.filter(status='ongoing').count(),
        },
    })
