"""
Views for Public Site - API endpoints for admin and public access.
"""
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Q
from .models import PublicSettings, News, Complaint
from .serializers import (
    PublicSettingsSerializer,
    NewsListSerializer,
    NewsDetailSerializer,
    NewsAdminSerializer,
    ComplaintSerializer,
    ComplaintAdminSerializer,
)


class PublicSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing public site settings.
    Admin only for modifications, public read access.
    """
    queryset = PublicSettings.objects.all()
    serializer_class = PublicSettingsSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'current']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny()])
    def current(self, request):
        """Get the current public settings (singleton)."""
        settings = PublicSettings.objects.first()
        if not settings:
            settings = PublicSettings.objects.create()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def news_list(request):
    """Simple function-based view for testing."""
    from .models import News
    from .serializers import NewsListSerializer
    
    news = News.objects.filter(
        status='published',
        published_at__isnull=False
    ).order_by('-published_at')
    
    serializer = NewsListSerializer(news, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def news_featured(request):
    """Simple function-based view for featured news."""
    from .models import News
    from .serializers import NewsListSerializer
    
    news = News.objects.filter(
        status='published',
        published_at__isnull=False,
        featured=True
    )[:3]
    
    serializer = NewsListSerializer(news, many=True)
    return Response(serializer.data)


class NewsAdminViewSet(viewsets.ModelViewSet):
    """
    Admin API for managing news and updates.
    Full CRUD operations for authenticated admins.
    """
    queryset = News.objects.all().order_by('-created_at')
    serializer_class = NewsAdminSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a news item."""
        news = self.get_object()
        news.status = 'published'
        news.published_at = timezone.now()
        news.save()
        serializer = self.get_serializer(news)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish a news item (mark as draft)."""
        news = self.get_object()
        news.status = 'draft'
        news.published_at = None
        news.save()
        serializer = self.get_serializer(news)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status of a news item."""
        news = self.get_object()
        news.featured = not news.featured
        news.save()
        serializer = self.get_serializer(news)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    Public complaint submission and admin management.
    """
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'track']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update', 'retrieve', 'list']:
            return ComplaintAdminSerializer
        return ComplaintSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def track(self, request):
        tracking_number = request.query_params.get('tracking_number')
        cnic = request.query_params.get('cnic')

        if tracking_number:
            complaint = Complaint.objects.filter(tracking_number=tracking_number).first()
            if not complaint:
                return Response({'detail': 'Complaint not found.'}, status=status.HTTP_404_NOT_FOUND)
            serializer = ComplaintSerializer(complaint)
            return Response(serializer.data)

        if cnic:
            complaints = Complaint.objects.filter(cnic=cnic).order_by('-created_at')
            serializer = ComplaintSerializer(complaints, many=True)
            return Response(serializer.data)

        return Response(
            {'detail': 'Please provide a tracking_number or cnic to search.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
