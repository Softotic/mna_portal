"""
URL configuration for MNA Portal.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # For Vercel with routePrefix '/api', requests arrive without the prefix
    path('auth/', include('users.auth_urls')),
    path('users/', include('users.urls')),
    path('roles/', include('users.role_urls')),
    path('', include('schemes.urls')),
    path('public/', include('public_site.urls')),
    # Also support full /api/auth/ paths for local dev
    path('api/auth/', include('users.auth_urls')),
    path('api/users/', include('users.urls')),
    path('api/roles/', include('users.role_urls')),
    path('api/', include('schemes.urls')),
    path('api/public/', include('public_site.urls')),
]
