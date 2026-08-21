import django.db.models.deletion
from django.db import migrations, models


def create_permission_module(apps, schema_editor):
    Module = apps.get_model('users', 'Module')
    Role = apps.get_model('users', 'Role')
    RolePermission = apps.get_model('users', 'RolePermission')

    module, _ = Module.objects.update_or_create(
        key='UNION_COUNCILS',
        defaults={'name': 'Union Councils'},
    )
    for role in Role.objects.filter(name='Super Admin'):
        RolePermission.objects.update_or_create(
            role=role,
            module=module,
            defaults={
                'can_view': True,
                'can_create': True,
                'can_edit': True,
                'can_delete': True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ('schemes', '0009_schemeentry_status'),
        ('users', '0002_expand_delegatable_modules'),
    ]

    operations = [
        migrations.CreateModel(
            name='UnionCouncil',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['name']},
        ),
        migrations.AddField(
            model_name='schemeentry',
            name='union_council',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='scheme_entries',
                to='schemes.unioncouncil',
            ),
        ),
        migrations.RunPython(create_permission_module, migrations.RunPython.noop),
    ]
