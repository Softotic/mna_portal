from django.test import TestCase
from rest_framework.test import APIClient

from schemes.models import SchemeCategory, UnionCouncil

from .models import PortfolioScheme
from .serializers import PortfolioSchemeSerializer


class SharedPortfolioUnionCouncilTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.used_council = UnionCouncil.objects.create(name='Mithi')
        self.unused_council = UnionCouncil.objects.create(name='Unused Council')
        self.category = SchemeCategory.objects.create(name='Education')
        self.scheme = PortfolioScheme.objects.create(
            union_council=self.used_council,
            category=self.category,
            name='Education scheme',
        )

    def test_public_portfolio_filter_uses_shared_metadata(self):
        response = self.client.get('/api/public/portfolio/union-councils/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [(row['id'], row['name']) for row in response.data],
            [(self.used_council.id, self.used_council.name)],
        )

    def test_public_portfolio_categories_use_shared_metadata(self):
        response = self.client.get('/api/public/portfolio/categories/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [(row['id'], row['name']) for row in response.data],
            [(self.category.id, self.category.name)],
        )

    def test_scheme_accepts_shared_category_and_union_council(self):
        second_category = SchemeCategory.objects.create(name='Health')
        serializer = PortfolioSchemeSerializer(data={
            'union_council': self.unused_council.id,
            'category': second_category.id,
            'name': 'Shared metadata scheme',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
