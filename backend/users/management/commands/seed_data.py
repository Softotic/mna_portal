"""
Management command to seed default admin user, roles, and permissions.
"""
from django.core.management.base import BaseCommand
from users.models import CustomUser, Role, Permission
from schemes.models import Department


class Command(BaseCommand):
    help = 'Seed default roles, permissions, departments, and admin user'

    def handle(self, *args, **options):
        self.stdout.write('Seeding permissions...')
        modules = ['users', 'schemes']
        actions = ['add', 'edit', 'delete', 'view']
        permissions = []

        for module in modules:
            for action in actions:
                perm, created = Permission.objects.get_or_create(
                    module=module,
                    action=action,
                    defaults={
                        'codename': f'{action}_{module}',
                        'name': f'Can {action} {module}',
                    }
                )
                permissions.append(perm)
                if created:
                    self.stdout.write(f'  Created permission: {perm.codename}')

        # Create roles
        self.stdout.write('Seeding roles...')

        admin_role, _ = Role.objects.get_or_create(
            name='Admin',
            defaults={'description': 'Full access to all modules'}
        )
        admin_role.permissions.set(permissions)

        manager_role, _ = Role.objects.get_or_create(
            name='Manager',
            defaults={'description': 'Can view and edit schemes'}
        )
        manager_perms = Permission.objects.filter(
            module='schemes', action__in=['add', 'edit', 'view']
        )
        manager_role.permissions.set(manager_perms)

        viewer_role, _ = Role.objects.get_or_create(
            name='Viewer',
            defaults={'description': 'View-only access'}
        )
        viewer_perms = Permission.objects.filter(action='view')
        viewer_role.permissions.set(viewer_perms)

        # Create default departments
        self.stdout.write('Seeding departments...')
        departments = [
            'Education', 'Healthcare', 'Infrastructure',
            'Agriculture', 'Finance', 'Social Welfare',
        ]
        for dept_name in departments:
            Department.objects.get_or_create(name=dept_name)

        # Create superadmin user
        self.stdout.write('Seeding admin user...')
        if not CustomUser.objects.filter(email='admin@mna.gov.pk').exists():
            user = CustomUser.objects.create_superuser(
                email='admin@mna.gov.pk',
                password='Admin@123',
                name='System Admin',
            )
            user.role = admin_role
            user.save()
            self.stdout.write(self.style.SUCCESS(
                'Admin user created: admin@mna.gov.pk / Admin@123'
            ))
        else:
            self.stdout.write('Admin user already exists.')

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
