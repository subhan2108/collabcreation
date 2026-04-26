# myapp/management/commands/auto_lock_disputes.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from myapp.models import Dispute, Collaboration, ChatMessage  # adjust app name
from django.db.models import Q

class Command(BaseCommand):
    help = "Auto-lock collaborations with disputes older than 7 days without reply"

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(days=7)
        disputes = Dispute.objects.filter(created_at__lte=cutoff, status='pending')
        locked_count = 0

        for d in disputes:
            collab = d.collaboration
            # find messages exchanged after dispute created
            msgs_after = ChatMessage.objects.filter(
                Q(sender=collab.brand, receiver=collab.creator) | Q(sender=collab.creator, receiver=collab.brand),
                timestamp__gt=d.created_at
            )
            if not msgs_after.exists():
                collab.is_locked = True
                collab.save()
                locked_count += 1
                # notify both parties
                from myapp.models import Notification
                Notification.objects.create(recipient=collab.brand, message=f"Collaboration #{collab.id} locked due to unresolved dispute")
                Notification.objects.create(recipient=collab.creator, message=f"Collaboration #{collab.id} locked due to unresolved dispute")

        self.stdout.write(self.style.SUCCESS(f"Locked {locked_count} collaborations"))
