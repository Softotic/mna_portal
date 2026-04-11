"""
Users app serializers.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Role, Permission


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'module', 'action', 'codename', 'name']
        read_only_fields = ['codename', 'name']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(), many=True, write_only=True,
        source='permissions', required=False
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permission_ids',
                  'user_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_user_count(self, obj):
        return obj.users.count()


class RoleMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    role_detail = RoleMinimalSerializer(source='role', read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True,
        required=False, allow_null=True
    )
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'role_detail', 'role_id',
                  'is_active', 'is_staff', 'password', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            validate_password(password, user)
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            validate_password(password, instance)
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ProfileSerializer(serializers.ModelSerializer):
    role_detail = RoleMinimalSerializer(source='role', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'role_detail', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at', 'role_detail']


class UserPermissionSerializer(serializers.Serializer):
    """Returns flattened permissions for the current user."""
    permissions = serializers.SerializerMethodField()

    def get_permissions(self, user):
        if user.is_superuser:
            return {f"{p.module}.{p.action}": True for p in Permission.objects.all()}
        if not user.role:
            return {}
        return {
            f"{p.module}.{p.action}": True
            for p in user.role.permissions.all()
        }
