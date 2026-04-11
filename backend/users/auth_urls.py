"""Auth URL routes."""
from django.urls import path
from .views import login_view, logout_view, token_refresh_view

urlpatterns = [
    path('login/', login_view, name='auth-login'),
    path('logout/', logout_view, name='auth-logout'),
    path('refresh/', token_refresh_view, name='auth-refresh'),
]
