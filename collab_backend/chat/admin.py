from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "receiver", "message", "timestamp")
    list_filter = ("sender", "receiver")
    search_fields = ("message",)
