from django.db import migrations


MISSING_SCHEME_COLUMNS = ('description', 'budget')


def restore_scheme_columns(apps, schema_editor):
    """Repair databases created by the removed dynamic-scheme migrations."""
    Scheme = apps.get_model('schemes', 'Scheme')
    table_name = Scheme._meta.db_table

    with schema_editor.connection.cursor() as cursor:
        existing_columns = {
            column.name
            for column in schema_editor.connection.introspection.get_table_description(cursor, table_name)
        }

    for column_name in MISSING_SCHEME_COLUMNS:
        if column_name not in existing_columns:
            schema_editor.add_field(Scheme, Scheme._meta.get_field(column_name))


class Migration(migrations.Migration):
    dependencies = [
        ('schemes', '0005_schemeentrycomment'),
    ]

    operations = [
        migrations.RunPython(restore_scheme_columns, migrations.RunPython.noop),
    ]

