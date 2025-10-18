from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model


class User(AbstractUser):
    ROLE_CHOICES = [
        ("creator", "Creator"),
        ("brand", "Brand"),
    ]
    email = models.EmailField(unique=True)  # make email unique
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="creator")

    def __str__(self):
        return self.username
 

User = get_user_model()


# Creator Onboarding
class CreatorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    username_handle = models.CharField(max_length=50)
    primary_platform = models.CharField(max_length=100)
    followers_count = models.PositiveIntegerField()
    bio = models.TextField()
    approved = models.BooleanField(default=False)  # admin approves onboarding
    banned = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to="creator_profiles/", null=True, blank=True)

    def __str__(self):
        return f"Creator: {self.user.username}"
    
# Brand Onboarding
class BrandProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    brand_name = models.CharField(max_length=100)
    website_social = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    primary_goal = models.CharField(max_length=200)
    approved = models.BooleanField(default=False)  # admin approves onboarding
    banned = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to="brand_profiles/", null=True, blank=True)

    def __str__(self):
        return f"Brand: {self.user.username}"
    
class Project(models.Model):
    brand = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=100)
    description = models.TextField()
    skills_required = models.CharField(max_length=200)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

class Application(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="applications")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    pitch = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=(('pending','Pending'),('hired','Hired'),('rejected','Rejected')), default='pending')


class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.recipient.username} - {self.message}"