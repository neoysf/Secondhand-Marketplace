from django.urls import path
from .views import ConversationStartView, ConversationListView, MessageListCreateView

urlpatterns = [
    path('', ConversationListView.as_view(), name='conversation-list'),
    path('<int:listing_id>/start/', ConversationStartView.as_view(), name='conversation-start'),
    path('<int:conversation_id>/messages/', MessageListCreateView.as_view(), name='message-list-create'),
]