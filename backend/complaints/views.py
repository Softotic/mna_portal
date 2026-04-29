"""
Views for the Complaint Management System.
"""
from rest_framework import viewsets, status, views, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Complaint
from .serializers import (
    ComplaintSubmitSerializer,
    ComplaintSubmitResponseSerializer,
    ComplaintTrackSerializer,
    ComplaintAdminListSerializer,
    ComplaintAdminDetailSerializer,
)


class PublicComplaintSubmitView(generics.CreateAPIView):
    """
    Public endpoint to submit a new complaint.
    Returns tracking ID upon success.
    """
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSubmitSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        
        response_serializer = ComplaintSubmitResponseSerializer(complaint)
        headers = self.get_success_headers(serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PublicComplaintTrackView(generics.ListAPIView):
    """
    Public endpoint to track complaints by tracking_id or cnic.
    Returns limited information.
    """
    serializer_class = ComplaintTrackSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        tracking_id = self.request.query_params.get('tracking_id')
        cnic = self.request.query_params.get('cnic')
        
        if not tracking_id and not cnic:
            return Complaint.objects.none()

        queryset = Complaint.objects.all()
        if tracking_id:
            queryset = queryset.filter(tracking_id__iexact=tracking_id.strip())
        if cnic:
            queryset = queryset.filter(cnic=cnic.strip())
            
        return queryset

    def list(self, request, *args, **kwargs):
        tracking_id = request.query_params.get('tracking_id')
        cnic = request.query_params.get('cnic')
        
        if not tracking_id and not cnic:
            return Response(
                {"detail": "Please provide either tracking_id or cnic parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return super().list(request, *args, **kwargs)


class AdminComplaintViewSet(viewsets.ModelViewSet):
    """
    Admin endpoint for managing complaints.
    Requires authentication.
    """
    queryset = Complaint.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['tracking_id', 'name', 'cnic', 'phone']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['list']:
            return ComplaintAdminListSerializer
        return ComplaintAdminDetailSerializer
