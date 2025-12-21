from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# Register your models here.


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Add 'id' to list display
    list_display = ('id', 'username', 'email', 'is_staff', 'is_active')
    list_display_links = ('username',)

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



admin.site.register(Collaboration)


admin.site.register(Review)


@admin.register(DisputeMessage)
class DisputeMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "dispute", "sender", "is_system", "created_at")
    list_filter = ("is_system",)
    readonly_fields = ("created_at",)



class DisputeMessageInline(admin.TabularInline):
    model = DisputeMessage
    extra = 1

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    inlines = [DisputeMessageInline]
    list_display = ("id", "status", "raised_by", "created_at")
