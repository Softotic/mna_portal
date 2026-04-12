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
        if request.user.is_superuser:
            return True

        action = getattr(view, 'action', None)
        # If it's not a viewset standard action, maybe allow it if we only map standards,
        # but let's be strict. If action is mapped, check it.
        required_action = self.action_permission_map.get(action)
        if hasattr(view, 'required_action'):
            # Allow overriding the required action in the view directly
            required_action = view.required_action

        if not required_action:
            # If we don't know the action requirement, default to False for strict RBAC
            return False

        module = getattr(view, 'module_key', self.module_key)
        return request.user.has_module_permission(module, required_action)


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
