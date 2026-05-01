import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0009_teammember_order_and_single_featured'),
    ]

    operations = [
        migrations.CreateModel(
            name='PortfolioUnionCouncil',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('sort_order', models.PositiveIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Portfolio Union Council',
                'verbose_name_plural': 'Portfolio Union Councils',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='PortfolioCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('sort_order', models.PositiveIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('union_council', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='categories', to='public_site.portfoliounioncouncil')),
            ],
            options={
                'verbose_name': 'Portfolio Category',
                'verbose_name_plural': 'Portfolio Categories',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='PortfolioScheme',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=500)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('ongoing', 'Ongoing'), ('past', 'Past'), ('future', 'Future')], default='ongoing', max_length=20)),
                ('image', models.FileField(blank=True, null=True, upload_to='public/portfolio/images/', validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])])),
                ('attachment', models.FileField(blank=True, null=True, upload_to='public/portfolio/attachments/')),
                ('tags', models.CharField(blank=True, help_text='Comma-separated tags', max_length=500)),
                ('notes', models.TextField(blank=True)),
                ('sort_order', models.PositiveIntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schemes', to='public_site.portfoliocategory')),
                ('union_council', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schemes', to='public_site.portfoliounioncouncil')),
            ],
            options={
                'verbose_name': 'Portfolio Scheme',
                'verbose_name_plural': 'Portfolio Schemes',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.AddIndex(
            model_name='portfolioscheme',
            index=models.Index(fields=['status', 'sort_order'], name='public_site_status_8d5856_idx'),
        ),
        migrations.AddIndex(
            model_name='portfolioscheme',
            index=models.Index(fields=['union_council', 'category', 'sort_order'], name='public_site_union_c_397d92_idx'),
        ),
    ]
