from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('schemes', '0011_scheme_template_union_council'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='schemeentry',
            name='union_council',
        ),
    ]
