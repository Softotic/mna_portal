"""Role management URL routes."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, PermissionListView

router = DefaultRouter()
router.register('', RoleViewSet, basename='roles')

urlpatterns = [
    path('permissions/', PermissionListView.as_view(), name='permission-list'),
    path('', include(router.urls)),
]
