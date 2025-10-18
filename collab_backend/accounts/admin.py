from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(User)

admin.site.register(Project)
admin.site.register(Application)

@admin.register(CreatorProfile)
class CreatorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'username_handle', 'primary_platform', 'followers_count', 'approved', 'banned')
    list_filter = ('approved', 'banned', 'primary_platform')
    search_fields = ('user__username', 'full_name', 'username_handle')

@admin.register(BrandProfile)
class BrandProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'brand_name', 'website_social', 'primary_goal', 'approved', 'banned')
    list_filter = ('approved', 'banned')
    search_fields = ('user__username', 'brand_name', 'primary_goal')

