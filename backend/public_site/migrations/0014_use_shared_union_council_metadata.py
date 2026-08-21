import django.db.models.deletion
from django.db import migrations, models


def copy_portfolio_union_councils(apps, schema_editor):
    PortfolioUnionCouncil = apps.get_model('public_site', 'PortfolioUnionCouncil')
    PortfolioCategory = apps.get_model('public_site', 'PortfolioCategory')
    PortfolioScheme = apps.get_model('public_site', 'PortfolioScheme')
    UnionCouncil = apps.get_model('schemes', 'UnionCouncil')

    council_map = {}
    for portfolio_council in PortfolioUnionCouncil.objects.all():
        name = portfolio_council.name.strip()
        shared_council = UnionCouncil.objects.filter(name__iexact=name).first()
        if shared_council is None:
            shared_council = UnionCouncil.objects.create(name=name)
        council_map[portfolio_council.pk] = shared_council.pk

    for old_id, shared_id in council_map.items():
        PortfolioCategory.objects.filter(union_council_id=old_id).update(
            shared_union_council_id=shared_id
        )
        PortfolioScheme.objects.filter(union_council_id=old_id).update(
            shared_union_council_id=shared_id
        )


class Migration(migrations.Migration):

    dependencies = [
        ('public_site', '0013_publicsettings_about_image'),
        ('schemes', '0012_remove_entry_union_council'),
    ]

    operations = [
        migrations.AddField(
            model_name='portfoliocategory',
            name='shared_union_council',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='schemes.unioncouncil',
            ),
        ),
        migrations.AddField(
            model_name='portfolioscheme',
            name='shared_union_council',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='schemes.unioncouncil',
            ),
        ),
        migrations.RunPython(copy_portfolio_union_councils, migrations.RunPython.noop),
        migrations.RemoveIndex(
            model_name='portfolioscheme',
            name='public_site_union_c_359518_idx',
        ),
        migrations.RemoveField(
            model_name='portfoliocategory',
            name='union_council',
        ),
        migrations.RemoveField(
            model_name='portfolioscheme',
            name='union_council',
        ),
        migrations.RenameField(
            model_name='portfoliocategory',
            old_name='shared_union_council',
            new_name='union_council',
        ),
        migrations.RenameField(
            model_name='portfolioscheme',
            old_name='shared_union_council',
            new_name='union_council',
        ),
        migrations.AlterField(
            model_name='portfoliocategory',
            name='union_council',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='portfolio_categories',
                to='schemes.unioncouncil',
            ),
        ),
        migrations.AlterField(
            model_name='portfolioscheme',
            name='union_council',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='portfolio_schemes',
                to='schemes.unioncouncil',
            ),
        ),
        migrations.AddIndex(
            model_name='portfolioscheme',
            index=models.Index(
                fields=['union_council', 'category', 'sort_order'],
                name='public_site_union_c_359518_idx',
            ),
        ),
        migrations.DeleteModel(name='PortfolioUnionCouncil'),
    ]
