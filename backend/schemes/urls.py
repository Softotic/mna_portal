"""Schemes app URL routes."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SchemeViewSet, DepartmentViewSet

router = DefaultRouter()
router.register('schemes', SchemeViewSet, basename='schemes')
router.register('departments', DepartmentViewSet, basename='departments')

urlpatterns = [
    path('', include(router.urls)),
]
