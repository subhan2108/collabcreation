from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import *

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


class CreatorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreatorProfile
        fields = "__all__"
        read_only_fields = ["user"]



class BrandProfileSerializer(serializers.ModelSerializer):
    projects_count = serializers.SerializerMethodField()

    class Meta:
        model = BrandProfile
        fields = '__all__'
        read_only_fields = ['user']

    def get_projects_count(self, obj):
        return obj.user.projects.count()

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['brand', 'created_at']

class ApplicationSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.creatorprofile.full_name', read_only=True)
    creator_followers = serializers.IntegerField(source='creator.creatorprofile.followers_count', read_only=True)
    creator_platform = serializers.CharField(source='creator.creatorprofile.primary_platform', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['creator', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read', 'data']

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    reviewee_name = serializers.CharField(source='reviewee.username', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'reviewer_name', 'reviewee', 'reviewee_name', 'project', 'project_title', 'rating', 'review_text', 'created_at']
        read_only_fields = ['reviewer', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']



class CollaborationSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    brand = UserSerializer(read_only=True)
    creator = UserSerializer(read_only=True)

    class Meta:
        model = Collaboration
        fields = "__all__"



class DisputeSerializer(serializers.ModelSerializer):
    raised_by_name = serializers.CharField(source="raised_by.username", read_only=True)

    class Meta:
        model = Dispute
        fields = [
            "id",
            "raised_by",
            "raised_by_name",
            "collaboration",
            "reason",
            "description",
            "evidence",
            "status",
            "admin_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["raised_by", "status", "admin_notes", "created_at", "updated_at"]


class InviteSerializer(serializers.Serializer):
    creator_id = serializers.IntegerField()
    project_id = serializers.IntegerField()
    message = serializers.CharField(allow_blank=True, required=False)

class LockSerializer(serializers.Serializer):
    is_locked = serializers.BooleanField()



class CreatorProjectViewSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    collaboration_id = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "title", "description", "budget", "status", "collaboration_id"]

    def get_status(self, project):
        user = self.context["request"].user
        app = Application.objects.filter(
            project=project,
            creator=user
        ).first()
        return app.status if app else None

    def get_collaboration_id(self, project):
        user = self.context["request"].user
        collab = Collaboration.objects.filter(
            project=project,
            creator=user
        ).first()
        return collab.id if collab else None
