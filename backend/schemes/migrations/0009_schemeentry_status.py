from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('schemes', '0008_remove_obsolete_dynamic_scheme_tables'),
    ]

    operations = [
        migrations.AddField(
            model_name='schemeentry',
            name='status',
            field=models.CharField(
                choices=[
                    ('announced_not_started', 'Announced but not started'),
                    ('in_progress', 'In progress'),
                    ('completed_to_be_inaugurated', 'Completed – to be inaugurated'),
                    ('completed_inaugurated', 'Completed and inaugurated'),
                ],
                default='announced_not_started',
                max_length=40,
            ),
        ),
    ]
