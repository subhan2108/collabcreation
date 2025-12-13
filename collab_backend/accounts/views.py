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
from chat.models import ChatMessage

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser

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
        user_id = self.kwargs["pk"]

        # Step 1: validate user exists and is a creator
        user = User.objects.filter(id=user_id, role="creator").first()
        if not user:
            raise NotFound("Creator not found")

        # Step 2: auto-create empty profile if missing
        profile, created = CreatorProfile.objects.get_or_create(user=user)

        return profile



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




# views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "role": request.user.role,
    })



class ActivateUserView(APIView):
    def patch(self, request, pk):
        user = request.user
        try:
            collab = Collaboration.objects.get(pk=pk)
            if collab.brand == user:
                collab.brand_active = True
            elif collab.creator == user:
                collab.creator_active = True
            collab.save()
            return Response({
                "brand_active": collab.brand_active,
                "creator_active": collab.creator_active
            })
        except Collaboration.DoesNotExist:
            return Response({"error": "Collaboration not found"}, status=404)



from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404

class CreateDispute(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, collab_id):
        try:
            collab = Collaboration.objects.get(id=collab_id)
        except Collaboration.DoesNotExist:
            return Response({"error": "Collaboration not found"}, status=404)

        reason = request.data.get("reason")
        desc = request.data.get("description")
        evidence = request.FILES.get("evidence")

        if not reason or not desc:
            return Response({"error": "Reason and description required"}, status=400)

        dispute = Dispute.objects.create(
            raised_by=request.user,
            collaboration=collab,
            reason=reason,
            description=desc,
            evidence=evidence
        )

        return Response(DisputeSerializer(dispute, context={"request": request}).data, status=201)

class CollaborationDisputes(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, collab_id):
        disputes = Dispute.objects.filter(collaboration_id=collab_id).order_by("-created_at")
        return Response(DisputeSerializer(disputes, many=True, context={"request": request}).data)



class MyDisputes(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        disputes = Dispute.objects.filter(raised_by=request.user).order_by("-created_at")
        return Response(DisputeSerializer(disputes, many=True).data)


class UpdateDispute(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, dispute_id):
        try:
            dispute = Dispute.objects.get(id=dispute_id)
        except Dispute.DoesNotExist:
            return Response({"error": "Dispute not found"}, status=404)

        dispute.status = request.data.get("status", dispute.status)
        dispute.admin_notes = request.data.get("admin_notes", dispute.admin_notes)
        dispute.save()

        return Response(DisputeSerializer(dispute).data)




# views.py (add imports at top)
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

# Add invite endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_creator(request):
    """
    Body: { creator_id, project_id, message (optional) }
    Brand must own the project.
    Creates ChatMessage and Notification and returns 201.
    """
    creator_id = request.data.get('creator_id')
    project_id = request.data.get('project_id')
    message = request.data.get('message', '').strip()

    if not creator_id or not project_id:
        return Response({"error": "creator_id and project_id required"}, status=400)

    project = get_object_or_404(Project, id=project_id)
    if project.brand != request.user:
        return Response({"error": "You are not the owner of this project."}, status=403)

    creator = get_object_or_404(User, id=creator_id)

    # Optional: create an 'invited' application or just notify + chat message
    ChatMessage.objects.create(sender=request.user, receiver=creator, message=message or f"{request.user.username} invited you to collaborate on '{project.title}'")
    Notification.objects.create(recipient=creator, message=f"{request.user.username} invited you to collaborate on '{project.title}'", data={"project_id": project.id, "invited_by": request.user.id})

    # Optional: create an Application record with status 'invited'
    try:
        Application.objects.create(project=project, creator=creator, pitch=message or "Invited by brand", status="pending")
    except Exception:
        pass

    return Response({"success": True, "message": "Invitation sent"}, status=201)


# Lock endpoint: participant or admin can lock/unlock
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def lock_collaboration(request, collab_id):
    """
    PATCH body: { is_locked: true/false }
    Participants or admin can lock/unlock a collaboration.
    """
    collab = get_object_or_404(Collaboration, id=collab_id)
    is_locked = request.data.get('is_locked')
    if is_locked is None:
        return Response({"error": "is_locked required"}, status=400)

    # Only participants or admins can lock/unlock
    if not (request.user == collab.brand or request.user == collab.creator or request.user.is_staff):
        return Response({"error": "Not allowed"}, status=403)

    collab.is_locked = bool(is_locked)
    collab.save()

    return Response({"id": collab.id, "is_locked": collab.is_locked})


# Admin responds to dispute (creates admin chat message + notification)
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_respond_dispute(request, dispute_id):
    """
    Admin updates dispute and optionally sends message to both parties.
    body: { status (optional), admin_notes (optional), message (optional) }
    """
    dispute = get_object_or_404(Dispute, id=dispute_id)
    status_val = request.data.get('status', None)
    admin_notes = request.data.get('admin_notes', None)
    message = request.data.get('message', None)

    if status_val:
        dispute.status = status_val
    if admin_notes is not None:
        dispute.admin_notes = admin_notes
    dispute.updated_at = timezone.now()
    dispute.save()

    # Create admin chat message to both parties so both see it in chat
    if message:
        # admin -> brand
        ChatMessage.objects.create(sender=request.user, receiver=dispute.collaboration.brand, message=f"[Admin] {message}")
        # admin -> creator
        ChatMessage.objects.create(sender=request.user, receiver=dispute.collaboration.creator, message=f"[Admin] {message}")

        Notification.objects.create(recipient=dispute.collaboration.brand, message=f"Admin responded to dispute #{dispute.id}", data={"dispute_id": dispute.id})
        Notification.objects.create(recipient=dispute.collaboration.creator, message=f"Admin responded to dispute #{dispute.id}", data={"dispute_id": dispute.id})

    return Response({"success": True, "dispute": DisputeSerializer(dispute).data})

