"""
Custom DRF permissions for RBAC.
"""
from rest_framework.permissions import BasePermission


class HasModulePermission(BasePermission):
    """
    Checks the user has the required module+action permission.
    Usage in views: set `module_name` and map actions in `action_permission_map`.
    """
    module_name = ''  # Override in view
    action_permission_map = {
        'list': 'view',
        'retrieve': 'view',
        'create': 'add',
        'update': 'edit',
        'partial_update': 'edit',
        'destroy': 'delete',
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True

        action = getattr(view, 'action', None)
        if not action:
            return True

        required_action = self.action_permission_map.get(action)
        if not required_action:
            return True

        module = getattr(view, 'module_name', self.module_name)
        return request.user.has_module_permission(module, required_action)


class IsAdminUser(BasePermission):
    """Only superusers or admins can access."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or (
            request.user.role and request.user.role.name == 'Admin'
        )


class UserModulePermission(HasModulePermission):
    module_name = 'users'


class SchemeModulePermission(HasModulePermission):
    module_name = 'schemes'
