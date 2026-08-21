from unittest.mock import patch

from django.db.models.deletion import ProtectedError
from django.test import TestCase
from rest_framework.test import APIClient

from users.models import CustomUser

from .models import Scheme, SchemeCategory, SchemeTemplate
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
