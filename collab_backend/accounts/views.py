from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.tokens import RefreshToken
from .models import GuestUser
from .models import *
from .serializers import *

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

# ---------------------------
# AUTH VIEWS
# ---------------------------

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        })


# ---------------------------
# ONBOARDING
# ---------------------------

class CreatorOnboardingView(generics.CreateAPIView):
    serializer_class = CreatorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'creatorprofile'):
            raise NotFound("Profile already exists.")
        serializer.save(user=self.request.user)


class BrandOnboardingView(generics.CreateAPIView):
    serializer_class = BrandProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'brandprofile'):
            raise NotFound("Profile already exists.")
        serializer.save(user=self.request.user)


# ---------------------------
# PROFILE VIEWS
# ---------------------------

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
        if hasattr(self.request.user, "brandprofile"):
            return self.request.user.brandprofile
        raise NotFound("No brand profile found for this user.")


# ---------------------------
# PROJECT VIEWS
# ---------------------------

class ProjectCreateView(generics.CreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(brand=self.request.user)


class ProjectListView(generics.ListAPIView):
    """
    ✅ Shows all projects to everyone (creators & brands)
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]  # public view

    def get_queryset(self):
        return Project.objects.all().select_related("brand").order_by("-id")


class MyProjectListView(generics.ListAPIView):
    """
    ✅ Shows only the logged-in brand's own projects
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(brand=user).order_by("-id")


class ProjectDetailView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]


# ---------------------------
# APPLICATION VIEWS
# ---------------------------

class ApplicationCreateView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'brandprofile'):
            return Application.objects.filter(project__brand=user)
        return Application.objects.filter(creator=user)



    def post(self, request, pk):
        try:
            app = Application.objects.get(id=pk)
            app.status = "hired"
            app.save()

            collab, created = Collaboration.objects.get_or_create(
                project=app.project,
                brand=app.project.brand,
                creator=app.creator
            )

            Notification.objects.create(
                recipient=app.creator,
                message=f"🎉 Congratulations {app.creator.username}, you’ve been hired for '{app.project.title}'."
            )

            return Response({
                "success": True,
                "status": "hired",
                "collaboration_id": collab.id   # ✅ important!
            })

        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    
# ------------------------------------------------------
# ✅ Step 1: Brand hires creator → collaboration created
# ------------------------------------------------------
class ApplicationHireView(APIView):
    def post(self, request, pk):
        try:
            app = Application.objects.get(id=pk)
            app.status = "hired"
            app.save()

            # ✅ Create or get the collaboration
            collab, created = Collaboration.objects.get_or_create(
                project=app.project,
                brand=app.project.brand,
                creator=app.creator,
                defaults={"status": "active"},  # optional
            )

            # ✅ Notify the creator
            Notification.objects.create(
                recipient=app.creator,
                message=f"🎉 Congratulations {app.creator.username}, you’ve been hired for '{app.project.title}'.",
                data={"collaboration_id": collab.id}
            )

            return Response({
                "success": True,
                "status": "hired",
                "collaboration_id": collab.id,
                "message": "Creator hired and collaboration created successfully!"
            }, status=status.HTTP_200_OK)

        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class ApplicationRejectView(APIView):
    def post(self, request, pk):
        try:
            app = Application.objects.get(id=pk)
            app.status = "rejected"
            app.save()
            Notification.objects.create(
                recipient=app.creator,
                message=f"❌ Sorry {app.creator.username}, you were not selected for '{app.project.title}'."
            )
            return Response({"success": True, "status": "rejected"})
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------------------
# NOTIFICATIONS
# ---------------------------

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(recipient=user).order_by('-created_at')


# ---------------------------
# REVIEWS
# ---------------------------

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        reviewee_id = self.request.query_params.get('reviewee')
        if reviewee_id:
            return Review.objects.filter(reviewee_id=reviewee_id).order_by('-created_at')
        return Review.objects.filter(reviewee=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)

    @action(detail=False, methods=['get'], url_path='average-rating/(?P<user_id>\d+)')
    def average_rating(self, request, user_id=None):
        try:
            user = User.objects.get(id=user_id)
            avg_rating = user.average_rating
            review_count = user.reviews_received.count()
            return Response({
                'average_rating': avg_rating,
                'review_count': review_count
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


# ---------------------------
# LIST VIEWS (ALL CREATORS / BRANDS)
# ---------------------------

class CreatorListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(role='creator')


class BrandListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(role='brand')


# ---------------------------
# DETAIL VIEWS (CREATOR / BRAND)
# ---------------------------

class BrandDetailView(generics.RetrieveAPIView):
    serializer_class = BrandProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        user_id = self.kwargs['pk']
        try:
            return BrandProfile.objects.get(user_id=user_id)
        except BrandProfile.DoesNotExist:
            raise NotFound("Brand profile not found")


class CreatorDetailView(generics.RetrieveAPIView):
    serializer_class = CreatorProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        user_id = self.kwargs['pk']
        try:
            return CreatorProfile.objects.get(user_id=user_id)
        except CreatorProfile.DoesNotExist:
            raise NotFound("Creator profile not found")


class BrandProjectsView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        brand_user_id = self.kwargs['pk']
        return Project.objects.filter(brand_id=brand_user_id)


class GuestRegisterView(APIView):
    def post(self, request):
        role = request.data.get("role")
        if role not in ["creator", "brand"]:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        guest = GuestUser.objects.create(role=role)
        return Response({"guest_id": str(guest.id), "role": role}, status=status.HTTP_201_CREATED)



class CollaborationListView(generics.ListAPIView):
    serializer_class = CollaborationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "brand":
            return Collaboration.objects.filter(brand=user)
        elif user.role == "creator":
            return Collaboration.objects.filter(creator=user)
        return Collaboration.objects.none()




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def onboarding_status(request):
    user = request.user
    role = user.role  # assuming User model has role field: "creator" or "brand"
    if role == "creator":
        completed = CreatorProfile.objects.filter(user=user).exists()
    elif role == "brand":
        completed = BrandProfile.objects.filter(user=user).exists()
    else:
        completed = False

    return Response({"role": role, "completed": completed})