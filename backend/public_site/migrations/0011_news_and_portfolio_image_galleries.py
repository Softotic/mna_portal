import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0010_portfolio_models'),
    ]

    operations = [
        migrations.CreateModel(
            name='NewsImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.FileField(upload_to='public/news/', validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])])),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('news', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='public_site.news')),
            ],
            options={
                'ordering': ['sort_order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='PortfolioSchemeImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.FileField(upload_to='public/portfolio/images/', validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])])),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('scheme', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='public_site.portfolioscheme')),
            ],
            options={
                'ordering': ['sort_order', 'id'],
            },
        ),
    ]
