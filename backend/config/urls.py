"""
URL configuration for MNA Portal.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.auth_urls')),
    path('api/users/', include('users.urls')),
    path('api/roles/', include('users.role_urls')),
    path('api/', include('schemes.urls')),
]
