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
from .models import (
    PublicSettings,
    News,
    Complaint,
    ComplaintUpdate,
    CitizenFeedback,
    TeamMember,
    PortfolioUnionCouncil,
    PortfolioCategory,
    PortfolioScheme,
    PortfolioSchemeImage,
    NewsImage,
)
from .serializers import (
    PublicSettingsSerializer,
    CitizenFeedbackSerializer,
    TeamMemberSerializer,
    PortfolioUnionCouncilSerializer,
    PortfolioCategorySerializer,
    PortfolioSchemeSerializer,
    NewsListSerializer,
    NewsDetailSerializer,
    NewsAdminSerializer,
    ComplaintSerializer,
    ComplaintAdminSerializer,
)
from users.permissions import HasModulePermission, IsAdminUser


class PublicReadModulePermissionMixin:
    """Keep published reads public while enforcing RBAC in the admin portal."""

    public_actions = ('list', 'retrieve')

    def get_permissions(self):
        if self.action in self.public_actions and not self.request.user.is_authenticated:
            return [AllowAny()]
        return [IsAuthenticated(), HasModulePermission()]


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
        return [IsAuthenticated(), IsAdminUser()]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny()])
    def current(self, request):
        """Get the current public settings (singleton)."""
        settings = PublicSettings.objects.first()
        if not settings:
            settings = PublicSettings.objects.create()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


class CitizenFeedbackViewSet(PublicReadModulePermissionMixin, viewsets.ModelViewSet):
    """Public feedback listing and admin feedback management."""

    queryset = CitizenFeedback.objects.all().order_by('sort_order', '-created_at')
    serializer_class = CitizenFeedbackSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['status', 'featured']
    search_fields = ['name', 'location', 'quote']
    ordering_fields = ['sort_order', 'created_at', 'updated_at']

    module_key = 'FEEDBACK'
    public_actions = ('list', 'retrieve', 'featured')

    def get_queryset(self):
        queryset = CitizenFeedback.objects.all().order_by('sort_order', '-created_at')
        if self.action in ['list', 'retrieve', 'featured'] and not getattr(self.request, 'user', None).is_authenticated:
            return queryset.filter(status='published')
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        feedbacks = self.get_queryset().filter(featured=True)[:6]
        serializer = self.get_serializer(feedbacks, many=True)
        return Response(serializer.data)


class TeamMemberViewSet(PublicReadModulePermissionMixin, viewsets.ModelViewSet):
    """Public team listing and admin team management."""

    queryset = TeamMember.objects.all().order_by('sort_order', 'name')
    serializer_class = TeamMemberSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['status', 'featured', 'department', 'union_council']
    search_fields = ['name', 'designation', 'email', 'phone', 'union_council', 'department', 'bio']
    ordering_fields = ['sort_order', 'name', 'created_at', 'updated_at']

    module_key = 'TEAM'
    public_actions = ('list', 'retrieve', 'featured')

    def get_queryset(self):
        queryset = TeamMember.objects.all().order_by('sort_order', 'name')
        if self.action in ['list', 'retrieve', 'featured'] and not getattr(self.request, 'user', None).is_authenticated:
            return queryset.filter(status='published')
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        members = self.get_queryset().filter(featured=True)[:8]
        serializer = self.get_serializer(members, many=True)
        return Response(serializer.data)


class PortfolioUnionCouncilViewSet(PublicReadModulePermissionMixin, viewsets.ModelViewSet):
    """Public portfolio union councils and admin management."""

    queryset = PortfolioUnionCouncil.objects.all().order_by('sort_order', 'name')
    serializer_class = PortfolioUnionCouncilSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ['name', 'description']
    ordering_fields = ['sort_order', 'name', 'created_at', 'updated_at']
    pagination_class = None

    module_key = 'PORTFOLIO'


class PortfolioCategoryViewSet(PublicReadModulePermissionMixin, viewsets.ModelViewSet):
    """Public portfolio categories and admin management."""

    queryset = PortfolioCategory.objects.select_related('union_council').all().order_by('sort_order', 'name')
    serializer_class = PortfolioCategorySerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['union_council']
    search_fields = ['name', 'description', 'union_council__name']
    ordering_fields = ['sort_order', 'name', 'created_at', 'updated_at']
    pagination_class = None

    module_key = 'PORTFOLIO'

    def get_queryset(self):
        queryset = PortfolioCategory.objects.select_related('union_council').all().order_by('sort_order', 'name')
        union_council = self.request.query_params.get('union_council')
        if union_council:
            queryset = queryset.filter(union_council_id=union_council)
        return queryset


class PortfolioSchemeViewSet(PublicReadModulePermissionMixin, viewsets.ModelViewSet):
    """Public portfolio schemes and admin management."""

    queryset = PortfolioScheme.objects.select_related('union_council', 'category').all().order_by('sort_order', 'name')
    serializer_class = PortfolioSchemeSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['union_council', 'category', 'status']
    search_fields = ['name', 'description', 'tags', 'notes', 'union_council__name', 'category__name']
    ordering_fields = ['sort_order', 'name', 'created_at', 'updated_at', 'status']
    pagination_class = None

    module_key = 'PORTFOLIO'

    def get_queryset(self):
        queryset = PortfolioScheme.objects.select_related('union_council', 'category').prefetch_related('images').all().order_by('sort_order', 'name')
        union_council = self.request.query_params.get('union_council')
        category = self.request.query_params.get('category')
        status_filter = self.request.query_params.get('status')
        if union_council:
            queryset = queryset.filter(union_council_id=union_council)
        if category:
            queryset = queryset.filter(category_id=category)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        scheme = serializer.save()
        for index, image in enumerate(self.request.FILES.getlist('images')):
            PortfolioSchemeImage.objects.create(scheme=scheme, image=image, sort_order=index)

    def perform_update(self, serializer):
        scheme = serializer.save()
        start_order = scheme.images.count()
        for index, image in enumerate(self.request.FILES.getlist('images'), start=start_order):
            PortfolioSchemeImage.objects.create(scheme=scheme, image=image, sort_order=index)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def news_list(request):
    """Simple function-based view for testing."""
    from .models import News
    from .serializers import NewsListSerializer
    
    news = News.objects.prefetch_related('images').filter(
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
    
    news = News.objects.prefetch_related('images').filter(
        status='published',
        published_at__isnull=False,
        featured=True
    )[:3]
    
    serializer = NewsListSerializer(news, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def news_detail(request, pk):
    """Public detail view for a single published news item."""
    news = News.objects.prefetch_related('images').filter(
        pk=pk,
        status='published',
        published_at__isnull=False,
    ).first()
    if not news:
        return Response({'detail': 'News article not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = NewsDetailSerializer(news)
    return Response(serializer.data)


class NewsAdminViewSet(viewsets.ModelViewSet):
    """
    Admin API for managing news and updates.
    Full CRUD operations for authenticated admins.
    """
    queryset = News.objects.prefetch_related('images').all().order_by('-created_at')
    serializer_class = NewsAdminSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_key = 'NEWS'
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        news = serializer.save()
        for index, image in enumerate(self.request.FILES.getlist('images')):
            NewsImage.objects.create(news=news, image=image, sort_order=index)

    def perform_update(self, serializer):
        news = serializer.save()
        start_order = news.images.count()
        for index, image in enumerate(self.request.FILES.getlist('images'), start=start_order):
            NewsImage.objects.create(news=news, image=image, sort_order=index)
    
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
    filterset_fields = ['status', 'category']
    search_fields = [
        'tracking_number',
        'name',
        'father_name',
        'village',
        'union_council',
        'cnic',
        'department',
        'phone',
        'description',
        'admin_remarks',
    ]
    ordering_fields = ['created_at', 'updated_at', 'status']
    module_key = 'COMPLAINTS'

    def get_permissions(self):
        if self.action in ['create', 'track']:
            return [AllowAny()]
        return [IsAuthenticated(), HasModulePermission()]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update', 'retrieve', 'list']:
            return ComplaintAdminSerializer
        return ComplaintSerializer

    def get_queryset(self):
        queryset = Complaint.objects.all().order_by('-created_at').prefetch_related('updates')
        if self.action in ['track']:
            return queryset
        return queryset

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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def add_update(self, request, pk=None):
        complaint = self.get_object()
        next_status = request.data.get('status') or complaint.status
        comment = (request.data.get('comment') or '').strip()
        attachment = request.FILES.get('attachment') or request.data.get('attachment')

        if next_status not in dict(Complaint.STATUS_CHOICES):
            return Response({'status': ['Invalid status supplied.']}, status=status.HTTP_400_BAD_REQUEST)

        if not comment and not attachment and next_status == complaint.status:
            return Response(
                {'detail': 'Add a status change, remark, or attachment before saving.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        complaint.status = next_status
        if comment:
            complaint.admin_remarks = comment
        if attachment:
            complaint.admin_attachment = attachment
        complaint.save(update_fields=['status', 'admin_remarks', 'admin_attachment', 'updated_at'])

        ComplaintUpdate.objects.create(
            complaint=complaint,
            status=next_status,
            comment=comment,
            attachment=attachment,
            created_by=request.user if request.user.is_authenticated else None,
        )

        serializer = ComplaintAdminSerializer(complaint, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_201_CREATED)
