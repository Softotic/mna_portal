"""
Custom DRF permissions for RBAC.
"""
from rest_framework.permissions import BasePermission

class HasModulePermission(BasePermission):
    """
    Checks the user has the required module+action permission based on RolePermission matrix.
    Usage in views: set `module_key` and map actions in `action_permission_map`.
    """
    module_key = ''  # Override in view (e.g., 'USERS')
    action_permission_map = {
        'list': 'view',
        'retrieve': 'view',
        'create': 'create',
        'update': 'edit',
        'partial_update': 'edit',
        'destroy': 'delete',
        'toggle_active': 'edit', # Custom endpoints map to standard actions
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or (request.user.role and request.user.role.name == 'Super Admin'):
            return True

        action = getattr(view, 'action', None)
        # If it's not a viewset standard action, maybe allow it if we only map standards,
        # but let's be strict. If action is mapped, check it.
        required_action = self.action_permission_map.get(action)
        # Check if the view dynamically set the module_key on the request, fallback to view, then self.
        module_key = getattr(request, 'module_key', getattr(view, 'module_key', self.module_key))
        
        if hasattr(view, 'required_action'):
            # Allow overriding the required action in the view directly
            required_action = getattr(view, 'required_action', required_action)
        
        if not required_action:
            # If we don't know the action requirement, default to False for strict RBAC
            return False

        return request.user.has_module_permission(module_key, required_action)

    def has_object_permission(self, request, view, obj):
        # For object-level checks, if the object is linked to a dynamic category module, extract it.
        # This allows us to check GET /api/schemes/1/ securely utilizing the Scheme's parent category.
        module_key = getattr(request, 'module_key', None)
        
        if hasattr(obj, 'category') and obj.category:
            module_key = obj.category.slug.upper()

        if not module_key:
            return True

        action = getattr(view, 'action', None)
        required_action = getattr(view, 'required_action', self.action_permission_map.get(action))
        if not required_action:
            return False
            
        return request.user.has_module_permission(module_key, required_action)


class IsAdminUser(BasePermission):
    """Only superusers or explicit Admins can access."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or (
            request.user.role and request.user.role.name == 'Super Admin'
        )


class UserModulePermission(HasModulePermission):
    module_key = 'USERS'


class SchemeModulePermission(HasModulePermission):
    module_key = 'SCHEMES'
