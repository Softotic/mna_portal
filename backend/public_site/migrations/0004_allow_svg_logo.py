from django.core.validators import FileExtensionValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0003_citizenfeedback_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='publicsettings',
            name='logo',
            field=models.FileField(
                blank=True,
                help_text='Organization logo',
                null=True,
                upload_to='public/logo/',
                validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])],
            ),
        ),
    ]
