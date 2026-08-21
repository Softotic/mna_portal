from django.test import TestCase
from rest_framework.test import APIClient

from schemes.models import UnionCouncil

from .models import PortfolioCategory
from .serializers import PortfolioSchemeSerializer


class SharedPortfolioUnionCouncilTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.used_council = UnionCouncil.objects.create(name='Mithi')
        self.unused_council = UnionCouncil.objects.create(name='Unused Council')
        self.category = PortfolioCategory.objects.create(
            union_council=self.used_council,
            name='Education',
        )

    def test_public_portfolio_filter_uses_shared_metadata(self):
        response = self.client.get('/api/public/portfolio/union-councils/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [(row['id'], row['name']) for row in response.data],
            [(self.used_council.id, self.used_council.name)],
        )

    def test_scheme_category_must_match_union_council(self):
        serializer = PortfolioSchemeSerializer(data={
            'union_council': self.unused_council.id,
            'category': self.category.id,
            'name': 'Mismatched scheme',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('category', serializer.errors)
