from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from .models import ChatMessage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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
    users = list(User.objects.values("id", "username", "is_online", "last_seen"))
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
            "edited_at": msg.edited_at.isoformat() if msg.edited_at else None,
            "is_deleted": msg.is_deleted,
        }
        for msg in messages_qs
    ]
    return JsonResponse(data, safe=False)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_message(request, message_id):
    try:
        message = ChatMessage.objects.get(id=message_id, sender=request.user)
    except ChatMessage.DoesNotExist:
        return Response({"error": "Message not found or not authorized"}, status=status.HTTP_404_NOT_FOUND)

    new_message = request.data.get('message', '').strip()
    if not new_message:
        return Response({"error": "Message cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

    message.message = new_message
    message.edited_at = timezone.now()
    message.save()

    return Response({
        "id": message.id,
        "message": message.message,
        "edited_at": message.edited_at.isoformat(),
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    try:
        message = ChatMessage.objects.get(id=message_id, sender=request.user)
    except ChatMessage.DoesNotExist:
        return Response({"error": "Message not found or not authorized"}, status=status.HTTP_404_NOT_FOUND)

    message.is_deleted = True
    message.save()

    return Response({"message": "Message deleted successfully"})

