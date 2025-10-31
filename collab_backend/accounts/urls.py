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
    path('reviews/', ReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='reviews'),
    path('reviews/<int:pk>/', ReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='review-detail'),
    path('reviews/average-rating/<int:user_id>/', ReviewViewSet.as_view({'get': 'average_rating'}), name='average-rating'),

]
