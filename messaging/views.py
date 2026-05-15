from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Conversation, Message
from listings.models import Listing


class ConversationStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        try:
            listing = Listing.objects.get(pk=listing_id, status='active')
        except Listing.DoesNotExist:
            return Response({"error": "Listing not found"}, status=404)

        if listing.seller == request.user:
            return Response({"error": "You cannot message yourself"}, status=400)

        conversation, created = Conversation.objects.get_or_create(
            listing=listing,
            buyer=request.user,
            defaults={'seller': listing.seller}
        )

        return Response({
            "conversation_id": conversation.id,
            "listing": listing.title,
            "seller": listing.seller.username,
            "created": created
        }, status=201 if created else 200)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Conversation


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.all().order_by('-created_at')

        data = []

        for conv in conversations:
            last_message = conv.messages.last()

            data.append({
                "conversation_id": conv.id,
                "listing": conv.listing.title,
                "buyer": conv.buyer.username,
                "seller": conv.seller.username,
                "last_message": last_message.content if last_message else None,
            })

        return Response(data)


class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=404)

#        if request.user not in [conversation.buyer, conversation.seller]:
#            return Response({"error": "Access denied"}, status=403)

        messages = conversation.messages.all()
        data = [
            {
                "id": m.id,
                "sender": m.sender.username,
                "content": m.content,
                "sent_at": m.sent_at,
            }
            for m in messages
        ]
        return Response(data)

    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=404)

#        if request.user not in [conversation.buyer, conversation.seller]:
#            return Response({"error": "Access denied"}, status=403)

        content = request.data.get('content')
        if not content:
            return Response({"error": "Message content is required"}, status=400)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        return Response({
            "id": message.id,
            "sender": message.sender.username,
            "content": message.content,
            "sent_at": message.sent_at,
        }, status=201)