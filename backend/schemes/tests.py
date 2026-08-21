from unittest.mock import patch
from io import BytesIO

from django.db.models.deletion import ProtectedError
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from openpyxl import Workbook

from users.models import CustomUser

from .models import Scheme, SchemeCategory, SchemeEntry, SchemeTemplate
from .views import SchemeCategoryViewSet


class SchemeCategoryDeletionTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_superuser(
            email='category-admin@example.com',
            password='test-password',
            name='Category Admin',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_category_without_dependencies_can_be_deleted(self):
        category = SchemeCategory.objects.create(name='Unused Category')

        response = self.client.delete(f'/api/scheme-categories/{category.pk}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(SchemeCategory.objects.filter(pk=category.pk).exists())

    def test_category_with_scheme_is_not_deleted(self):
        category = SchemeCategory.objects.create(name='Category With Scheme')
        Scheme.objects.create(
            title='Existing Scheme',
            category=category,
            created_by=self.user,
        )

        response = self.client.delete(f'/api/scheme-categories/{category.pk}/')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.data['message'],
            'This category cannot be deleted because it has associated schemes or templates.',
        )
        self.assertTrue(SchemeCategory.objects.filter(pk=category.pk).exists())

    def test_category_with_template_is_not_deleted(self):
        category = SchemeCategory.objects.create(name='Category With Template')
        SchemeTemplate.objects.create(
            title='Existing Template',
            category=category,
            created_by=self.user,
        )

        response = self.client.delete(f'/api/scheme-categories/{category.pk}/')

        self.assertEqual(response.status_code, 400)
        self.assertTrue(SchemeCategory.objects.filter(pk=category.pk).exists())

    def test_protected_error_from_concurrent_dependency_is_handled(self):
        category = SchemeCategory.objects.create(name='Concurrent Dependency')

        error = ProtectedError('Category acquired a dependency', {category})
        with patch.object(SchemeCategoryViewSet, 'perform_destroy', side_effect=error):
            response = self.client.delete(f'/api/scheme-categories/{category.pk}/')

        self.assertEqual(response.status_code, 400)
        self.assertTrue(SchemeCategory.objects.filter(pk=category.pk).exists())


class SchemeEntryStatusTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_superuser(
            email='scheme-status-admin@example.com',
            password='test-password',
            name='Scheme Status Admin',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.category = SchemeCategory.objects.create(name='Status Category')
        self.template = SchemeTemplate.objects.create(
            title='Status Template',
            category=self.category,
            created_by=self.user,
        )

    def test_new_entry_defaults_to_announced_not_started(self):
        response = self.client.post(
            '/api/scheme-template-entries/',
            {'template_id': self.template.pk, 'values': {'Name': 'New scheme'}},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], SchemeEntry.STATUS_ANNOUNCED)
        self.assertEqual(response.data['status_display'], 'Announced but not started')

    def test_entry_status_can_be_updated(self):
        entry = SchemeEntry.objects.create(
            template=self.template,
            values={'Name': 'Active scheme'},
            created_by=self.user,
        )

        response = self.client.patch(
            f'/api/scheme-template-entries/{entry.pk}/',
            {'status': SchemeEntry.STATUS_IN_PROGRESS},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        entry.refresh_from_db()
        self.assertEqual(entry.status, SchemeEntry.STATUS_IN_PROGRESS)

    def test_unknown_entry_status_is_rejected(self):
        response = self.client.post(
            '/api/scheme-template-entries/',
            {
                'template_id': self.template.pk,
                'values': {'Name': 'Invalid status scheme'},
                'status': 'unknown',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('status', response.data)


class SchemeEntryImportTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_superuser(
            email='scheme-import-admin@example.com',
            password='test-password',
            name='Scheme Import Admin',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.category = SchemeCategory.objects.create(name='Import Category')
        self.template = SchemeTemplate.objects.create(
            title='Education Import',
            category=self.category,
            field_definitions=['S No.', 'School Type', 'Budget'],
            created_by=self.user,
        )

    def make_workbook(self, rows):
        workbook = Workbook()
        sheet = workbook.active
        for row in rows:
            sheet.append(row)
        output = BytesIO()
        workbook.save(output)
        return SimpleUploadedFile(
            'education.xlsx',
            output.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )

    def test_excel_import_can_be_previewed_without_creating_rows(self):
        upload = self.make_workbook([
            ['S No.', 'School Type', 'Budget', 'Status', 'Notes'],
            [1, 'Primary', 250000, 'In progress', 'ignored'],
            [2, 'High', 500000, '', 'ignored'],
        ])

        response = self.client.post(
            '/api/scheme-template-entries/import-file/',
            {
                'file': upload,
                'template_id': self.template.pk,
                'default_status': SchemeEntry.STATUS_ANNOUNCED,
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_rows'], 2)
        self.assertEqual(response.data['preview_rows'][0]['status'], SchemeEntry.STATUS_IN_PROGRESS)
        self.assertEqual(response.data['preview_rows'][0]['values']['Budget'], 250000)
        self.assertIn('Notes', response.data['unmatched_headers'])
        self.assertEqual(SchemeEntry.objects.count(), 0)

    def test_excel_import_creates_all_rows_on_confirmation(self):
        upload = self.make_workbook([
            ['S No', 'School Type', 'Budget'],
            [1, 'Primary', 250000],
            [2, 'High', 500000],
        ])

        response = self.client.post(
            '/api/scheme-template-entries/import-file/',
            {
                'file': upload,
                'template_id': self.template.pk,
                'default_status': SchemeEntry.STATUS_IN_PROGRESS,
                'commit': 'true',
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['created_count'], 2)
        self.assertEqual(SchemeEntry.objects.filter(template=self.template).count(), 2)
        imported = next(
            entry
            for entry in SchemeEntry.objects.filter(template=self.template)
            if entry.values['S No.'] == 1
        )
        self.assertEqual(imported.values['School Type'], 'Primary')
        self.assertEqual(imported.status, SchemeEntry.STATUS_IN_PROGRESS)

    def test_import_rejects_files_without_matching_headers(self):
        upload = self.make_workbook([
            ['Unrelated', 'Columns'],
            ['one', 'two'],
        ])

        response = self.client.post(
            '/api/scheme-template-entries/import-file/',
            {'file': upload, 'template_id': self.template.pk},
            format='multipart',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('No matching column headers', response.data['detail'])
        self.assertEqual(SchemeEntry.objects.count(), 0)
