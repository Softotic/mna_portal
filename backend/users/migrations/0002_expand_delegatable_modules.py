from django.db import migrations


PUBLIC_MODULES = (
    ('NEWS', 'News Management'),
    ('FEEDBACK', 'Feedback Management'),
    ('TEAM', 'Team Management'),
    ('PORTFOLIO', 'Portfolio Schemes'),
    ('COMPLAINTS', 'Complaints Management'),
)


def expand_modules(apps, schema_editor):
    Module = apps.get_model('users', 'Module')
    Role = apps.get_model('users', 'Role')
    RolePermission = apps.get_model('users', 'RolePermission')
    SchemeCategory = apps.get_model('schemes', 'SchemeCategory')

    modules = []
    for key, name in PUBLIC_MODULES:
        module, _ = Module.objects.update_or_create(key=key, defaults={'name': name})
        modules.append(module)

    for category in SchemeCategory.objects.all():
        module, _ = Module.objects.update_or_create(
            key=category.slug.upper(),
            defaults={'name': f'{category.name} Schemes'},
        )
        modules.append(module)

    super_admin, _ = Role.objects.get_or_create(
        name='Super Admin',
        defaults={'description': 'Full access to all modules and system capabilities'},
    )
    for module in Module.objects.all():
        RolePermission.objects.update_or_create(
            role=super_admin,
            module=module,
            defaults={
                'can_view': True,
                'can_create': True,
                'can_edit': True,
                'can_delete': True,
            },
        )

    RolePermission.objects.filter(
        module__key__in=('USERS', 'ROLES', 'SETTINGS'),
    ).exclude(role=super_admin).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
        ('schemes', '0009_schemeentry_status'),
    ]

    operations = [
        migrations.RunPython(expand_modules, migrations.RunPython.noop),
    ]
