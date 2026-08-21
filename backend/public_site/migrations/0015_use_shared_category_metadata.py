import django.db.models.deletion
from django.db import migrations, models
from django.utils.text import slugify


def unique_value(model, field, base):
    candidate = base
    suffix = 2
    while model.objects.filter(**{field: candidate}).exists():
        candidate = f'{base}_{suffix}'
        suffix += 1
    return candidate


def copy_portfolio_categories(apps, schema_editor):
    PortfolioCategory = apps.get_model('public_site', 'PortfolioCategory')
    PortfolioScheme = apps.get_model('public_site', 'PortfolioScheme')
    SchemeCategory = apps.get_model('schemes', 'SchemeCategory')

    category_map = {}
    for portfolio_category in PortfolioCategory.objects.all():
        name = portfolio_category.name.strip() or f'Portfolio Category {portfolio_category.pk}'
        shared_category = SchemeCategory.objects.filter(name__iexact=name).first()
        if shared_category is None:
            slug_base = slugify(name).upper().replace('-', '_') or 'CATEGORY'
            category_slug = unique_value(SchemeCategory, 'slug', slug_base)
            scheme_id = unique_value(SchemeCategory, 'scheme_id', f'{slug_base[:3]}-{portfolio_category.pk:02d}')
            shared_category = SchemeCategory.objects.create(
                name=name,
                slug=category_slug,
                scheme_id=scheme_id,
            )
        category_map[portfolio_category.pk] = shared_category.pk

    for old_id, shared_id in category_map.items():
        PortfolioScheme.objects.filter(category_id=old_id).update(shared_category_id=shared_id)


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0014_use_shared_union_council_metadata'),
        ('schemes', '0012_remove_entry_union_council'),
    ]

    operations = [
        migrations.AddField(
            model_name='portfolioscheme',
            name='shared_category',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='schemes.schemecategory',
            ),
        ),
        migrations.RunPython(copy_portfolio_categories, migrations.RunPython.noop),
        migrations.RemoveIndex(
            model_name='portfolioscheme',
            name='public_site_union_c_359518_idx',
        ),
        migrations.RemoveField(
            model_name='portfolioscheme',
            name='category',
        ),
        migrations.RenameField(
            model_name='portfolioscheme',
            old_name='shared_category',
            new_name='category',
        ),
        migrations.AlterField(
            model_name='portfolioscheme',
            name='category',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='portfolio_schemes',
                to='schemes.schemecategory',
            ),
        ),
        migrations.AddIndex(
            model_name='portfolioscheme',
            index=models.Index(
                fields=['union_council', 'category', 'sort_order'],
                name='public_site_union_c_359518_idx',
            ),
        ),
        migrations.DeleteModel(name='PortfolioCategory'),
    ]
