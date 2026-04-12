from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import SchemeCategory
from users.models import Module, Role, RolePermission

@receiver(post_save, sender=SchemeCategory)
def sync_module_on_category_save(sender, instance, created, **kwargs):
    """Ensure every SchemeCategory has a corresponding RBAC Module."""
    module_key = instance.slug.upper()
    module, module_created = Module.objects.update_or_create(
        key=module_key,
        defaults={'name': f'{instance.name} Schemes'}
    )
    
    # Automatically grant super admins full rights to the new module
    super_admins = Role.objects.filter(name='Super Admin')
    for admin_role in super_admins:
        RolePermission.objects.update_or_create(
            role=admin_role,
            module=module,
            defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}
        )

@receiver(post_delete, sender=SchemeCategory)
def delete_module_on_category_delete(sender, instance, **kwargs):
    """Cleanup RBAC modules when a categor is deleted (if it ever gets deleted)."""
    module_key = instance.slug.upper()
    Module.objects.filter(key=module_key).delete()
