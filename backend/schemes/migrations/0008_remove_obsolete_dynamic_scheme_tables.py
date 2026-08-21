from django.db import migrations


# These tables belonged to the retired SchemeColumn/SchemeData implementation.
# They are not represented by the current migration state, so Django cannot
# discover their foreign keys when it deletes a SchemeCategory.
OBSOLETE_TABLES = (
    'schemes_schemedata',
    'schemes_schemecolumn',
)


def remove_obsolete_dynamic_scheme_tables(apps, schema_editor):
    existing_tables = set(schema_editor.connection.introspection.table_names())
    quote = schema_editor.quote_name

    # Drop the data table first because it references the column table.
    for table_name in OBSOLETE_TABLES:
        if table_name in existing_tables:
            schema_editor.execute(f'DROP TABLE {quote(table_name)}')


class Migration(migrations.Migration):
    dependencies = [
        ('schemes', '0007_remove_obsolete_category_columns'),
    ]

    operations = [
        migrations.RunPython(
            remove_obsolete_dynamic_scheme_tables,
            migrations.RunPython.noop,
        ),
    ]
