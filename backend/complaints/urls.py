"""
URL configuration for the Complaint Management System.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicComplaintSubmitView,
    PublicComplaintTrackView,
    AdminComplaintViewSet,
)

router = DefaultRouter()
router.register(r'admin/complaints', AdminComplaintViewSet, basename='admin-complaints')

urlpatterns = [
    path('complaints/submit/', PublicComplaintSubmitView.as_view(), name='complaint-submit'),
    path('complaints/track/', PublicComplaintTrackView.as_view(), name='complaint-track'),
    path('', include(router.urls)),
]
