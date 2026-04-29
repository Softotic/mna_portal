from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0004_allow_svg_logo'),
    ]

    operations = [
        migrations.AddField(
            model_name='complaint',
            name='department',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='complaint',
            name='father_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='complaint',
            name='union_council',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='complaint',
            name='village',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
