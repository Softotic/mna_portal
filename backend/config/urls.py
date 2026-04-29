"""
URL configuration for MNA Portal.
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve

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

if not getattr(settings, 'VERCEL', False):
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
