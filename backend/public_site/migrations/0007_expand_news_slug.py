from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0006_relax_news_content_and_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='news',
            name='slug',
            field=models.SlugField(max_length=255, unique=True),
        ),
    ]
