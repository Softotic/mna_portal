from django.core.validators import FileExtensionValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0007_expand_news_slug'),
    ]

    operations = [
        migrations.CreateModel(
            name='TeamMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('designation', models.CharField(max_length=255)),
                ('photo', models.FileField(upload_to='public/team/', validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])])),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('phone', models.CharField(blank=True, max_length=50)),
                ('union_council', models.CharField(blank=True, max_length=255)),
                ('department', models.CharField(blank=True, max_length=255)),
                ('bio', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('published', 'Published')], default='published', max_length=20)),
                ('featured', models.BooleanField(default=False)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.AddIndex(
            model_name='teammember',
            index=models.Index(fields=['status', 'sort_order'], name='public_site_status_9f3526_idx'),
        ),
        migrations.AddIndex(
            model_name='teammember',
            index=models.Index(fields=['featured', 'sort_order'], name='public_site_feature_572287_idx'),
        ),
    ]
