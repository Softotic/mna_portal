import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('schemes', '0010_union_council_metadata'),
    ]

    operations = [
        migrations.AddField(
            model_name='schemetemplate',
            name='union_council',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='scheme_templates',
                to='schemes.unioncouncil',
            ),
        ),
    ]
