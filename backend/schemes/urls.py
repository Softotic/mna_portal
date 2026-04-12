"""Schemes app URL routes."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SchemeViewSet, SchemeCategoryViewSet

router = DefaultRouter()
router.register('schemes', SchemeViewSet, basename='schemes')
router.register('scheme-categories', SchemeCategoryViewSet, basename='scheme-categories')

urlpatterns = [
    path('', include(router.urls)),
]
