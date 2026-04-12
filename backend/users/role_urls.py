"""Role management URL routes."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, ModuleListView

router = DefaultRouter()
router.register('', RoleViewSet, basename='roles')

urlpatterns = [
    path('modules/', ModuleListView.as_view(), name='module-list'),
    path('', include(router.urls)),
]
