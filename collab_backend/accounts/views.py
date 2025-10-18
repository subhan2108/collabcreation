from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer
from rest_framework import generics, permissions
from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=user.username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }, status=status.HTTP_200_OK)


# Creator Onboarding
class CreatorOnboardingView(generics.CreateAPIView):
    serializer_class = CreatorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Check if user already submitted
        if hasattr(self.request.user, 'creatorprofile'):
            return Response({'detail': 'Profile already exists'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=self.request.user)

# Brand Onboarding
class BrandOnboardingView(generics.CreateAPIView):
    serializer_class = BrandProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'brandprofile'):
            return Response({'detail': 'Profile already exists'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(user=self.request.user)


# Profile views
class CreatorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CreatorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if hasattr(user, "creatorprofile"):
            return user.creatorprofile
        raise NotFound("No creator profile found for this user.")

class BrandProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = BrandProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.brandprofile

# Project views
class ProjectCreateView(generics.CreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(brand=self.request.user)

class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Creators see all projects
        if self.request.user.role == "creator":
            return Project.objects.all()
        # Brands see their own projects
        return Project.objects.filter(brand=self.request.user)

# Application views
class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "brand":
            return Application.objects.filter(project__brand=self.request.user)
        return Application.objects.filter(creator=self.request.user)
    

class ApplicationHireView(APIView):
    def post(self, request, pk):
        try:
            app = Application.objects.get(id=pk)
            app.status = "hired"
            app.save()
            return Response({"success": True, "status": "hired"})
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

class ApplicationRejectView(APIView):
    def post(self, request, pk):
        try:
            app = Application.objects.get(id=pk)
            app.status = "rejected"
            app.save()
            return Response({"success": True, "status": "rejected"})
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        




class ApplicationHireView(APIView):
    def post(self, request, pk):
        try:
            app = Application.objects.get(id=pk)
            app.status = "hired"
            app.save()

            # ✅ Create notification for creator
            Notification.objects.create(
                recipient=app.creator,  # assuming creator has OneToOne field to User
                message=f"🎉 Congratulations {app.creator.get_full_name() or app.creator.username}! You’ve been hired for '{app.project.title}'."

            )

            return Response({"success": True, "status": "hired"})
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)


class ApplicationRejectView(APIView):
    def post(self, request, pk):
        try:
            app = Application.objects.get(id=pk)
            app.status = "rejected"
            app.save()

            # ✅ Create notification for creator
            Notification.objects.create(
                recipient=app.creator,
                message=f"❌ Sorry {app.creator.get_full_name() or app.creator.username}, you were not selected for '{app.project.title}'."

            )

            return Response({"success": True, "status": "rejected"})
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(recipient=user).order_by('-created_at')