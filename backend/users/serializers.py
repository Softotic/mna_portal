"""
Users app serializers: Module, Role, RolePermission, CustomUser, Auth.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Role, Module, RolePermission

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'name', 'key']

class RolePermissionSerializer(serializers.ModelSerializer):
    module_key = serializers.CharField(source='module.key', read_only=True)
    module_name = serializers.CharField(source='module.name', read_only=True)
    module_id = serializers.PrimaryKeyRelatedField(
        queryset=Module.objects.all(), source='module', write_only=True
    )

    class Meta:
        model = RolePermission
        fields = ['id', 'module_id', 'module_key', 'module_name', 'can_view', 'can_create', 'can_edit', 'can_delete']

class RoleSerializer(serializers.ModelSerializer):
    permissions = RolePermissionSerializer(source='role_permissions', many=True, read_only=True)
    permissions_data = serializers.ListField(write_only=True, required=False)
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'permissions_data', 'user_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_user_count(self, obj):
        return obj.users.count()

    def validate_name(self, value):
        if self.instance:
            if Role.objects.filter(name__iexact=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Role with this name already exists.")
        else:
            if Role.objects.filter(name__iexact=value).exists():
                raise serializers.ValidationError("Role with this name already exists.")
        return value

    def _sync_permissions(self, role, perms_data):
        # perms_data format: [{"module_id": 1, "can_view": true, "can_create": false...}]
        # First, clear existing
        role.role_permissions.all().delete()
        for pdata in perms_data:
            metadata = pdata.get('module') or pdata
            module_id = metadata.get('module_id')
            if not module_id:
                continue
            RolePermission.objects.create(
                role=role,
                module_id=module_id,
                can_view=pdata.get('can_view', False),
                can_create=pdata.get('can_create', False),
                can_edit=pdata.get('can_edit', False),
                can_delete=pdata.get('can_delete', False),
            )

    def create(self, validated_data):
        perms_data = validated_data.pop('permissions_data', [])
        role = Role.objects.create(**validated_data)
        self._sync_permissions(role, perms_data)
        return role

    def update(self, instance, validated_data):
        perms_data = validated_data.pop('permissions_data', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if perms_data is not None:
            self._sync_permissions(instance, perms_data)
        return instance

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
    """Returns a flat object mapping modules to granular permissions."""
    permissions = serializers.SerializerMethodField()

    def get_permissions(self, user):
        # Super Users or Super Admin role get all permissions
        if user.is_superuser or (user.role and user.role.name == 'Super Admin'):
            perms = {}
            for m in Module.objects.all():
                perms[m.key] = {"view": True, "create": True, "edit": True, "delete": True}
            return perms
        
        perms = {}
        if user.role:
            for rp in user.role.role_permissions.all():
                perms[rp.module.key] = {
                    "view": rp.can_view,
                    "create": rp.can_create,
                    "edit": rp.can_edit,
                    "delete": rp.can_delete
                }
        return perms
