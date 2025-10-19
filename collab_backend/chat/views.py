from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import ChatMessage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

User = get_user_model()


def chat_room(request, user_id):
    users = User.objects.exclude(id=request.user.id)
    selected_user = get_object_or_404(User, id=user_id)

    # Load messages between current user and selected user
    messages_qs = ChatMessage.objects.filter(
        Q(sender=request.user, receiver=selected_user) |
        Q(sender=selected_user, receiver=request.user)
    ).order_by('timestamp')

    messages = [{
        'sender_id': msg.sender.id,
        'sender_username': msg.sender.username,
        'receiver_id': msg.receiver.id,
        'receiver_username': msg.receiver.username,
        'message': msg.message,
        'timestamp': msg.timestamp.isoformat(),
    } for msg in messages_qs]

    return render(request, 'chat/chat_room.html', {
        'users': users,
        'selected_user': selected_user,
        'messages': messages,
    })


def user_list(request):
    users = list(User.objects.values("id", "username"))
    return JsonResponse(users, safe=False)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_history(request, user_id):
    selected_user = get_object_or_404(User, id=user_id)

    messages_qs = ChatMessage.objects.filter(
        Q(sender=request.user, receiver=selected_user) |
        Q(sender=selected_user, receiver=request.user)
    ).order_by('timestamp')

    data = [
        {
            "id": msg.id,
            "sender_id": msg.sender.id,
            "sender_username": msg.sender.username,
            "receiver_id": msg.receiver.id,
            "receiver_username": msg.receiver.username,
            "message": msg.message,
            "self": msg.sender.id == request.user.id,  # <-- IMPORTANT
            "timestamp": msg.timestamp.isoformat(),
        }
        for msg in messages_qs
    ]
    return JsonResponse(data, safe=False)

