"""
Schemes app serializers.
"""
from rest_framework import serializers
from .models import Scheme, Department


class DepartmentSerializer(serializers.ModelSerializer):
    scheme_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'scheme_count', 'created_at']

    def get_scheme_count(self, obj):
        return obj.schemes.count()


class SchemeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True
    )

    class Meta:
        model = Scheme
        fields = [
            'id', 'title', 'description', 'department', 'department_id',
            'department_name', 'budget', 'status', 'created_by',
            'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'department']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
