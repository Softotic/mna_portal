from django.test import TestCase
from rest_framework.test import APIClient

from public_site.models import CitizenFeedback
from schemes.models import SchemeCategory
from users.models import CustomUser, Module, Role, RolePermission
from users.serializers import RoleSerializer


class RoleAdministrationBoundaryTests(TestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_superuser(
            email='admin-boundary@example.com',
            password='test-password',
            name='Admin Boundary',
        )
        self.role = Role.objects.create(name='Content Editor')
        self.user = CustomUser.objects.create_user(
            email='editor@example.com',
            password='test-password',
            name='Editor',
            role=self.role,
        )
        self.client = APIClient()

    def test_assignable_module_list_excludes_admin_only_modules(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/roles/modules/')

        self.assertEqual(response.status_code, 200)
        keys = {module['key'] for module in response.data}
        self.assertTrue({'NEWS', 'FEEDBACK', 'TEAM', 'PORTFOLIO', 'COMPLAINTS', 'UNION_COUNCILS'} <= keys)
        self.assertTrue({'USERS', 'ROLES', 'SETTINGS'}.isdisjoint(keys))

    def test_non_admin_cannot_access_users_or_roles_even_with_forged_permissions(self):
        for key in ('USERS', 'ROLES', 'SETTINGS'):
            module, _ = Module.objects.get_or_create(key=key, defaults={'name': key.title()})
            RolePermission.objects.create(
                role=self.role,
                module=module,
                can_view=True,
                can_create=True,
                can_edit=True,
                can_delete=True,
            )

        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get('/api/users/').status_code, 403)
        self.assertEqual(self.client.get('/api/roles/').status_code, 403)
        self.assertEqual(self.client.get('/api/roles/modules/').status_code, 403)

    def test_role_serializer_rejects_admin_only_permissions(self):
        users_module, _ = Module.objects.get_or_create(
            key='USERS', defaults={'name': 'Users Management'}
        )
        serializer = RoleSerializer(data={
            'name': 'Unsafe Role',
            'permissions_data': [{
                'module_id': users_module.id,
                'can_view': True,
            }],
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('permissions_data', serializer.errors)


class DelegatedModulePermissionTests(TestCase):
    def setUp(self):
        self.role = Role.objects.create(name='Delegated Viewer')
        self.user = CustomUser.objects.create_user(
            email='delegated@example.com',
            password='test-password',
            name='Delegated User',
            role=self.role,
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_each_scheme_category_gets_an_independent_module(self):
        category = SchemeCategory.objects.create(name='Education Projects')
        module = Module.objects.get(key=category.slug)
        RolePermission.objects.create(role=self.role, module=module, can_view=True)

        list_response = self.client.get(
            '/api/scheme-templates/',
            {'category_slug': category.slug.lower()},
        )
        create_response = self.client.post(
            '/api/scheme-templates/',
            {
                'title': 'Schools Register',
                'category_slug': category.slug,
                'field_definitions': ['School'],
            },
            format='json',
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(create_response.status_code, 403)

    def test_public_feedback_reads_stay_public_but_admin_reads_require_permission(self):
        CitizenFeedback.objects.create(
            name='Citizen', quote='Helpful service', status='published'
        )
        anonymous = APIClient()
        self.assertEqual(anonymous.get('/api/public/feedbacks/').status_code, 200)
        self.assertEqual(self.client.get('/api/public/feedbacks/').status_code, 403)

        feedback_module = Module.objects.get(key='FEEDBACK')
        RolePermission.objects.create(role=self.role, module=feedback_module, can_view=True)
        self.assertEqual(self.client.get('/api/public/feedbacks/').status_code, 200)
