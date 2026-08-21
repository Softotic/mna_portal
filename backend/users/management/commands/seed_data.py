"""
Management command to seed default admin user, roles, modules, and permissions.
"""
from django.core.management.base import BaseCommand
from users.models import CustomUser, Role, Module, RolePermission
from schemes.models import SchemeCategory, Scheme

class Command(BaseCommand):
    help = 'Seed default modules, roles, permissions, departments, and admin user'

    def handle(self, *args, **options):
        self.stdout.write('Seeding modules...')
        modules_data = [
            {'name': 'Users Management', 'key': 'USERS'},
            {'name': 'Roles Management', 'key': 'ROLES'},
            {'name': 'Categories', 'key': 'CATEGORIES'},
            {'name': 'Union Councils', 'key': 'UNION_COUNCILS'},
            {'name': 'Settings', 'key': 'SETTINGS'},
            {'name': 'News Management', 'key': 'NEWS'},
            {'name': 'Feedback Management', 'key': 'FEEDBACK'},
            {'name': 'Team Management', 'key': 'TEAM'},
            {'name': 'Portfolio Schemes', 'key': 'PORTFOLIO'},
            {'name': 'Complaints Management', 'key': 'COMPLAINTS'},
        ]
        
        modules = {}
        for m_data in modules_data:
            module, created = Module.objects.get_or_create(
                key=m_data['key'],
                defaults={'name': m_data['name']}
            )
            modules[m_data['key']] = module
            if created:
                self.stdout.write(f'  Created module: {module.key}')

        self.stdout.write('Seeding roles...')

        # Super Admin
        super_admin_role, _ = Role.objects.get_or_create(
            name='Super Admin',
            defaults={'description': 'Full access to all modules and system capabilities'}
        )
        for key, module in modules.items():
            RolePermission.objects.get_or_create(
                role=super_admin_role, module=module,
                defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}
            )

        # Manager
        manager_role, _ = Role.objects.get_or_create(
            name='Manager',
            defaults={'description': 'Can manage schemes and view users/settings'}
        )
        RolePermission.objects.get_or_create(
            role=manager_role, module=modules['CATEGORIES'],
            defaults={'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False}
        )

        # Viewer
        viewer_role, _ = Role.objects.get_or_create(
            name='Viewer',
            defaults={'description': 'View-only access to schemes'}
        )
        RolePermission.objects.get_or_create(
            role=viewer_role, module=modules['CATEGORIES'],
            defaults={'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False}
        )
        RolePermission.objects.filter(
            module__key__in=['USERS', 'ROLES', 'SETTINGS']
        ).exclude(role=super_admin_role).delete()

        self.stdout.write('Seeding categories...')
        categories = sorted([
            {"name": "Education"},
            {"name": "Health"},
            {"name": "Infrastructure"},
            {"name": "Communication"},
            {"name": "Energy"},
        ], key=lambda x: x["name"])

        for cdata in categories:
            SchemeCategory.objects.get_or_create(
                name=cdata["name"]
            )

        self.stdout.write('Seeding admin user...')
        user, user_created = CustomUser.objects.update_or_create(
            email='admin@mna.gov.pk',
            defaults={
                'name': 'System Admin',
                'role': super_admin_role,
                'is_superuser': True,
                'is_staff': True
            }
        )
        user.set_password('Admin@123')
        user.save()
        
        if user_created:
            self.stdout.write(self.style.SUCCESS('Admin user created: admin@mna.gov.pk / Admin@123'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin user updated and password reset.'))

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
