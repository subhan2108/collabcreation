from django.urls import path
from .views import RegisterView, LoginView
from .views import *
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('creator-onboarding/', CreatorOnboardingView.as_view(), name='creator-onboarding'),
    path('brand-onboarding/', BrandOnboardingView.as_view(), name='brand-onboarding'),
    path("creator-profile/", CreatorProfileView.as_view()),
    path("brand-profile/", BrandProfileView.as_view()),
    path("projects/", ProjectListView.as_view()),
    path("projects/create/", ProjectCreateView.as_view()),
    path("applications/", ApplicationListView.as_view()),
    path("applications/create/", ApplicationCreateView.as_view()),
    path("applications/<int:pk>/hire/", ApplicationHireView.as_view(), name="application-hire"),
    path("applications/<int:pk>/reject/", ApplicationRejectView.as_view(), name="application-reject"),
    path('notifications/', NotificationListView.as_view(), name='notifications'),


]
