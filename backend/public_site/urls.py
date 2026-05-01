"""
URL configuration for Public Site app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicSettingsViewSet,
    CitizenFeedbackViewSet,
    TeamMemberViewSet,
    PortfolioUnionCouncilViewSet,
    PortfolioCategoryViewSet,
    PortfolioSchemeViewSet,
    news_list,
    news_detail,
    news_featured,
    NewsAdminViewSet,
    ComplaintViewSet,
)

router = DefaultRouter()
router.register(r'settings', PublicSettingsViewSet, basename='settings')
router.register(r'feedbacks', CitizenFeedbackViewSet, basename='feedbacks')
router.register(r'team', TeamMemberViewSet, basename='team')
router.register(r'portfolio/union-councils', PortfolioUnionCouncilViewSet, basename='portfolio-union-councils')
router.register(r'portfolio/categories', PortfolioCategoryViewSet, basename='portfolio-categories')
router.register(r'portfolio/schemes', PortfolioSchemeViewSet, basename='portfolio-schemes')
router.register(r'admin/news', NewsAdminViewSet, basename='news-admin')
router.register(r'complaints', ComplaintViewSet, basename='complaints')

urlpatterns = [
    path('news/', news_list, name='news-list'),
    path('news/featured/', news_featured, name='news-featured'),
    path('news/<int:pk>/', news_detail, name='news-detail'),
    path('', include(router.urls)),
]
