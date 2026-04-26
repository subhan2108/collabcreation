from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatMessage(models.Model):
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )

    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)
    is_system = models.BooleanField(default=False)

    def __str__(self):
        if self.is_system:
            return f"System → {self.receiver}: {self.message[:30]}"
        return f"{self.sender} → {self.receiver}: {self.message[:30]}"
