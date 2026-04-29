import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0005_complaint_location_details'),
    ]

    operations = [
        migrations.AlterField(
            model_name='news',
            name='content',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='news',
            name='image',
            field=models.FileField(
                blank=True,
                null=True,
                upload_to='public/news/',
                validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])],
            ),
        ),
    ]
