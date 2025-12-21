from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "receiver", "message", "created_at", "is_system")
    list_filter = ("sender", "receiver", "is_system")
    search_fields = ("message",)
