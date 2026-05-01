from django.db import migrations, models


def normalize_team_order(apps, schema_editor):
    TeamMember = apps.get_model('public_site', 'TeamMember')
    members = list(TeamMember.objects.order_by('sort_order', 'created_at', 'name', 'id'))
    featured_seen = False

    for index, member in enumerate(members):
        member.sort_order = index
        if member.featured:
            if featured_seen:
                member.featured = False
            featured_seen = True
        member.save(update_fields=['sort_order', 'featured'])


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0008_teammember'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teammember',
            name='sort_order',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.RunPython(normalize_team_order, migrations.RunPython.noop),
    ]
