"""Schemes app URL routes."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SchemeViewSet, SchemeCategoryViewSet, SchemeTemplateViewSet, SchemeEntryViewSet

router = DefaultRouter()
router.register('schemes', SchemeViewSet, basename='schemes')
router.register('scheme-categories', SchemeCategoryViewSet, basename='scheme-categories')
router.register('scheme-templates', SchemeTemplateViewSet, basename='scheme-templates')
router.register('scheme-template-entries', SchemeEntryViewSet, basename='scheme-template-entries')

urlpatterns = [
    path('', include(router.urls)),
]
