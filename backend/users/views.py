"""
Users app views: auth, user CRUD, roles, profile, settings.
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
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from .models import CustomUser, Role, Permission
from .serializers import (
    LoginSerializer, UserSerializer, RoleSerializer,
    PermissionSerializer, ChangePasswordSerializer,
    ProfileSerializer, UserPermissionSerializer,
)
from .permissions import UserModulePermission, IsAdminUser

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
        logger.warning(f"Failed login attempt for: {email}")
        return Response(
            {'detail': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        logger.warning(f"Inactive user login attempt: {email}")
        return Response(
            {'detail': 'Account is deactivated. Contact administrator.'},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)
    logger.info(f"Successful login: {email}")

    # Build permissions map
    permissions = {}
    if user.is_superuser:
        for p in Permission.objects.all():
            permissions[f"{p.module}.{p.action}"] = True
    elif user.role:
        for p in user.role.permissions.all():
            permissions[f"{p.module}.{p.action}"] = True

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role.name if user.role else 'Superadmin',
            'is_superuser': user.is_superuser,
            'permissions': permissions,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist the refresh token."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    return Response({'detail': 'Logged out successfully.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh_view(request):
    """Refresh access token."""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'detail': 'Refresh token required.'}, status=400)
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    except Exception:
        return Response({'detail': 'Invalid or expired refresh token.'}, status=401)


# ─── User Management ViewSet ────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """CRUD for users. Admin only."""
    queryset = CustomUser.objects.select_related('role').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, UserModulePermission]
    module_name = 'users'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'role']
    search_fields = ['email', 'name']
    ordering_fields = ['name', 'email', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activate or deactivate a user."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        action_str = 'activated' if user.is_active else 'deactivated'
        logger.info(f"User {user.email} {action_str} by {request.user.email}")
        return Response({
            'detail': f'User {action_str} successfully.',
            'is_active': user.is_active,
        })


# ─── Role Management ViewSet ────────────────────────────────────────────────

class RoleViewSet(viewsets.ModelViewSet):
    """CRUD for roles. Admin only."""
    queryset = Role.objects.prefetch_related('permissions').all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [SearchFilter]
    search_fields = ['name']
    pagination_class = None  # Roles are few, no pagination needed


class PermissionListView(generics.ListAPIView):
    """List all available permissions."""
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


# ─── Profile & Settings ─────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get or update current user profile."""
    user = request.user
    if request.method == 'GET':
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

    serializer = ProfileSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    logger.info(f"Profile updated: {user.email}")
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change password for current user."""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response(
            {'old_password': 'Current password is incorrect.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    logger.info(f"Password changed: {user.email}")
    return Response({'detail': 'Password changed successfully.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_permissions_view(request):
    """Return the permissions for the logged-in user."""
    serializer = UserPermissionSerializer(request.user)
    return Response(serializer.data)


# ─── Dashboard Stats ────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """Return counts for dashboard."""
    from schemes.models import Scheme
    return Response({
        'total_users': CustomUser.objects.count(),
        'active_users': CustomUser.objects.filter(is_active=True).count(),
        'total_schemes': Scheme.objects.count(),
        'pending_schemes': Scheme.objects.filter(status='pending').count(),
        'approved_schemes': Scheme.objects.filter(status='approved').count(),
        'completed_schemes': Scheme.objects.filter(status='completed').count(),
        'total_roles': Role.objects.count(),
    })
