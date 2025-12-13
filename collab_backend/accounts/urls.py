from django.urls import path
from .views import *

urlpatterns = [
    # 🧍‍♂️ Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    # 🧑‍🎤 Onboarding
    path("creator-onboarding/", CreatorOnboardingView.as_view(), name="creator-onboarding"),
    path("brand-onboarding/", BrandOnboardingView.as_view(), name="brand-onboarding"),

    # 🧩 Profiles
    path("creator-profile/", CreatorProfileView.as_view(), name="creator-profile"),
    path("brand-profile/", BrandProfileView.as_view(), name="brand-profile"),

    # 🧱 Projects
    path("projects/", ProjectListView.as_view(), name="project-list"),             # ✅ All projects (for all users)
    path("projects/create/", ProjectCreateView.as_view(), name="project-create"),  # ✅ Brand can create new project
    path("projects/<int:pk>/", ProjectDetailView.as_view(), name="project-detail"), # ✅ Project detail

    # 🏢 Brand & Creator detail pages
    path("brands/", BrandListView.as_view(), name="brand-list"),                   # ✅ List all brands
    path("brands/<int:pk>/", BrandDetailView.as_view(), name="brand-detail"),      # ✅ Brand detail
    path("brands/<int:pk>/projects/", BrandProjectsView.as_view(), name="brand-projects"),  # ✅ Projects by a specific brand

    path("creators/", CreatorListView.as_view(), name="creator-list"),             # ✅ List all creators
    path("creators/<int:pk>/", CreatorDetailView.as_view(), name="creator-detail"), # ✅ Creator detail

    # 📬 Applications
    path("applications/", ApplicationListView.as_view(), name="application-list"),
    path("applications/create/", ApplicationCreateView.as_view(), name="application-create"),
    path("applications/<int:pk>/hire/", ApplicationHireView.as_view(), name="application-hire"),
    path("applications/<int:pk>/reject/", ApplicationRejectView.as_view(), name="application-reject"),

    # 🔔 Notifications
    path("notifications/", NotificationListView.as_view(), name="notifications"),

    # ⭐ Reviews
    path("reviews/", ReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name="reviews"),
    path("reviews/<int:pk>/", ReviewViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name="review-detail"),
    path("reviews/average-rating/<int:user_id>/", ReviewViewSet.as_view({'get': 'average_rating'}), name="average-rating"),
    path("guest/register/", GuestRegisterView.as_view(), name="guest-register"),
    path('collaborations/', CollaborationListView.as_view(), name='collaboration-list'),
    path("onboarding-status/", onboarding_status),
    path("me/", me),
    path("collabs/<int:collab_id>/disputes/create/", CreateDispute.as_view()),
    path("collabs/<int:collab_id>/disputes/", CollaborationDisputes.as_view()),
    path("disputes/my/", MyDisputes.as_view()),
    path("disputes/<int:dispute_id>/update/", UpdateDispute.as_view()),
    # urls.py additions
path("invite/", invite_creator, name="invite-creator"),
path("collaborations/<int:collab_id>/lock/", lock_collaboration, name="lock-collaboration"),
path("admin/disputes/<int:dispute_id>/respond/", admin_respond_dispute, name="admin-respond-dispute"),

]
