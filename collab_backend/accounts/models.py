from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [
        ("creator", "Creator"),
        ("brand", "Brand"),
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="creator")
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username

class CreatorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="creator_profile")
    full_name = models.CharField(max_length=100)
    handle = models.CharField(max_length=50)
    primary_platform = models.CharField(max_length=100)
    followers_count = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)
    profile_image = models.URLField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Creator: {self.user.username}"

class BrandProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="brand_profile")
    brand_name = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    goal = models.CharField(max_length=200, blank=True)
    profile_image = models.URLField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)

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
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="applications")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    pitch = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Collaboration(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="collaborations")
    brand = models.ForeignKey(User, on_delete=models.CASCADE, related_name="brand_collaborations")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="creator_collaborations")
    is_locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand.username} x {self.creator.username} - {self.project.title}"
