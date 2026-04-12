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
    permission_classes = [IsAuthenticated, UserModulePermission]
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

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.users.exists():
            return Response(
                {"detail": "Cannot delete role because it is assigned to users."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class ModuleListView(generics.ListAPIView):
    """List all available modules."""
    queryset = Module.objects.all()
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
