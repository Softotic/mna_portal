"""
URL configuration for Public Site app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicSettingsViewSet,
    CitizenFeedbackViewSet,
    news_list,
    news_detail,
    news_featured,
    NewsAdminViewSet,
    ComplaintViewSet,
)

router = DefaultRouter()
router.register(r'settings', PublicSettingsViewSet, basename='settings')
router.register(r'feedbacks', CitizenFeedbackViewSet, basename='feedbacks')
router.register(r'admin/news', NewsAdminViewSet, basename='news-admin')
router.register(r'complaints', ComplaintViewSet, basename='complaints')

urlpatterns = [
    path('news/', news_list, name='news-list'),
    path('news/featured/', news_featured, name='news-featured'),
    path('news/<int:pk>/', news_detail, name='news-detail'),
    path('', include(router.urls)),
]
