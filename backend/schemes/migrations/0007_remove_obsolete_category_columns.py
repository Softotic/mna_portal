from django.db import migrations


OBSOLETE_CATEGORY_COLUMNS = ('scheme_title',)


def remove_obsolete_category_columns(apps, schema_editor):
    """Remove columns left behind by migrations no longer present in the project."""
    SchemeCategory = apps.get_model('schemes', 'SchemeCategory')
    table_name = SchemeCategory._meta.db_table

    with schema_editor.connection.cursor() as cursor:
        existing_columns = {
            column.name
            for column in schema_editor.connection.introspection.get_table_description(cursor, table_name)
        }

    quote = schema_editor.quote_name
    for column_name in OBSOLETE_CATEGORY_COLUMNS:
        if column_name in existing_columns:
            schema_editor.execute(
                f'ALTER TABLE {quote(table_name)} DROP COLUMN {quote(column_name)}'
            )


class Migration(migrations.Migration):
    dependencies = [
        ('schemes', '0006_repair_scheme_columns'),
    ]

    operations = [
        migrations.RunPython(remove_obsolete_category_columns, migrations.RunPython.noop),
    ]

