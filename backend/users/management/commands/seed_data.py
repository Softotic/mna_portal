"""
Management command to seed default admin user, roles, modules, and permissions.
"""
from django.core.management.base import BaseCommand
from users.models import CustomUser, Role, Module, RolePermission
from schemes.models import Department

class Command(BaseCommand):
    help = 'Seed default modules, roles, permissions, departments, and admin user'

    def handle(self, *args, **options):
        self.stdout.write('Seeding modules...')
        modules_data = [
            {'name': 'Users Management', 'key': 'USERS'},
            {'name': 'Schemes Management', 'key': 'SCHEMES'},
            {'name': 'Roles Management', 'key': 'ROLES'},
            {'name': 'Settings', 'key': 'SETTINGS'},
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
            role=manager_role, module=modules['SCHEMES'],
            defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False}
        )
        RolePermission.objects.get_or_create(
            role=manager_role, module=modules['USERS'],
            defaults={'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False}
        )
        RolePermission.objects.get_or_create(
            role=manager_role, module=modules['SETTINGS'],
            defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False}
        )

        # Viewer
        viewer_role, _ = Role.objects.get_or_create(
            name='Viewer',
            defaults={'description': 'View-only access to schemes'}
        )
        RolePermission.objects.get_or_create(
            role=viewer_role, module=modules['SCHEMES'],
            defaults={'can_view': True, 'can_create': False, 'can_edit': False, 'can_delete': False}
        )
        RolePermission.objects.get_or_create(
            role=viewer_role, module=modules['SETTINGS'],
            defaults={'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': False}
        )

        self.stdout.write('Seeding departments...')
        departments = [
            'Education', 'Healthcare', 'Infrastructure',
            'Agriculture', 'Finance', 'Social Welfare',
        ]
        for dept_name in departments:
            Department.objects.get_or_create(name=dept_name)

        self.stdout.write('Seeding admin user...')
        if not CustomUser.objects.filter(email='admin@mna.gov.pk').exists():
            user = CustomUser.objects.create_superuser(
                email='admin@mna.gov.pk',
                password='Admin@123',
                name='System Admin',
            )
            user.role = super_admin_role
            user.save()
            self.stdout.write(self.style.SUCCESS('Admin user created: admin@mna.gov.pk / Admin@123'))
        else:
            self.stdout.write('Admin user already exists.')

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
