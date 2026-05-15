from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Avg
from .models import Review
from users.models import User


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, seller_id):
        try:
            seller = User.objects.get(pk=seller_id, role='seller')
        except User.DoesNotExist:
            return Response({"error": "Seller not found"}, status=404)

        if seller == request.user:
            return Response({"error": "You cannot review yourself"}, status=400)

        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating:
            return Response({"error": "Rating is required"}, status=400)

        try:
            rating = int(rating)
        except ValueError:
            return Response({"error": "Rating must be a number"}, status=400)

        if rating < 1 or rating > 5:
            return Response({"error": "Rating must be between 1 and 5"}, status=400)

        if Review.objects.filter(reviewer=request.user, seller=seller).exists():
            return Response({"error": "You already reviewed this seller"}, status=400)

        review = Review.objects.create(
            reviewer=request.user,
            seller=seller,
            rating=rating,
            comment=comment
        )

        return Response({
            "message": "Review submitted",
            "reviewer": review.reviewer.username,
            "seller": review.seller.username,
            "rating": review.rating,
            "comment": review.comment,
        }, status=201)


class SellerProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, seller_id):
        try:
            seller = User.objects.get(pk=seller_id, role='seller')
        except User.DoesNotExist:
            return Response({"error": "Seller not found"}, status=404)

        reviews = Review.objects.filter(seller=seller)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']

        data = {
            "username": seller.username,
            "location": seller.location,
            "bio": seller.bio,
            "average_rating": round(avg_rating, 2) if avg_rating else None,
            "total_reviews": reviews.count(),
            "reviews": [
                {
                    "reviewer": r.reviewer.username,
                    "rating": r.rating,
                    "comment": r.comment,
                    "created_at": r.created_at,
                }
                for r in reviews
            ]
        }
        return Response(data)