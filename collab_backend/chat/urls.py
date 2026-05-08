from django.urls import path
from . import views

urlpatterns = [
   # path("<int:user_id>/", views.chat_room, name="chat_room"),
    path("users/", views.user_list, name="user_list"),
   #path('chat/history/<int:user_id>/<int:receiver_id>/', views.chat_history, name='chat_history'),
   path("history/<int:user_id>/", views.chat_history, name="chat_history"),
   path("message/<int:message_id>/edit/", views.edit_message, name="edit_message"),
   path("message/<int:message_id>/delete/", views.delete_message, name="delete_message"),
]
