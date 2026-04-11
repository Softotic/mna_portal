"""User management URL routes."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, profile_view, change_password_view,
    my_permissions_view, dashboard_stats_view,
)

router = DefaultRouter()
router.register('', UserViewSet, basename='users')

urlpatterns = [
    path('profile/', profile_view, name='user-profile'),
    path('change-password/', change_password_view, name='change-password'),
    path('my-permissions/', my_permissions_view, name='my-permissions'),
    path('dashboard-stats/', dashboard_stats_view, name='dashboard-stats'),
    path('', include(router.urls)),
]
