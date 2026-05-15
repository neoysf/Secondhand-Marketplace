from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Listing, ListingImage, Category, Favourite
from .serializers import ListingSerializer, CategorySerializer, FavouriteSerializer
from users.permissions import IsSeller
from rest_framework.permissions import IsAuthenticated



class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        return Response(CategorySerializer(categories, many=True).data)


class ListingListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]   

    def get(self, request):
        listings = Listing.objects.filter(status='active')

        category = request.query_params.get('category')
        condition = request.query_params.get('condition')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        search = request.query_params.get('search')
        sort = request.query_params.get('sort', 'newest')

        if category:
            listings = listings.filter(category__slug=category)
        if condition:
            listings = listings.filter(condition=condition)
        if min_price:
            listings = listings.filter(price__gte=min_price)
        if max_price:
            listings = listings.filter(price__lte=max_price)
        if search:
            listings = listings.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        if sort == 'price_asc':
            listings = listings.order_by('price')
        elif sort == 'price_desc':
            listings = listings.order_by('-price')
        else:
            listings = listings.order_by('-created_at')

        return Response(ListingSerializer(listings, many=True).data)

    def post(self, request):
        print("USER:", request.user)
        print("IS AUTH:", request.user.is_authenticated)
        print("AUTH HEADER:", request.headers.get("Authorization"))

        serializer = ListingSerializer(data=request.data)

        if serializer.is_valid():
            listing = serializer.save(seller=request.user)

            images = request.FILES.getlist('images')
            for image in images[:5]:
                ListingImage.objects.create(
                    listing=listing,
                    image=image
                )

            return Response(
                ListingSerializer(listing).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListingDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print("USER:", request.user)
        print("IS AUTH:", request.user.is_authenticated)
        print("AUTH HEADER:", request.headers.get("Authorization"))

        serializer = ListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(seller=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_object(self, pk, user=None):
        try:
            if user:
                return Listing.objects.get(pk=pk, seller=user)
            return Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return None

    def get(self, request, pk):
        listing = self.get_object(pk)
        if not listing:
            return Response({"error": "Listing not found"}, status=404)
        return Response(ListingSerializer(listing).data)

    def put(self, request, pk):
        listing = self.get_object(pk, user=request.user)
        if not listing:
            return Response({"error": "Not found or not your listing"}, status=404)
        serializer = ListingSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        listing = self.get_object(pk, user=request.user)
        if not listing:
            return Response({"error": "Not found or not your listing"}, status=404)
        listing.delete()
        return Response({"message": "Listing deleted"})


class MarkAsSoldView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]

    def patch(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk, seller=request.user)
        except Listing.DoesNotExist:
            return Response({"error": "Not found or not your listing"}, status=404)
        listing.status = 'sold'
        listing.save()
        return Response({"message": "Listing marked as sold"})


class FavouriteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response({"error": "Listing not found"}, status=404)

        fav, created = Favourite.objects.get_or_create(user=request.user, listing=listing)
        if not created:
            fav.delete()
            return Response({"message": "Removed from favourites"})
        return Response({"message": "Added to favourites"}, status=201)


class FavouriteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favs = Favourite.objects.filter(user=request.user)
        return Response(FavouriteSerializer(favs, many=True).data)


class MyListingsView(APIView):
    permission_classes = [IsAuthenticated, IsSeller]

    def get(self, request):
        listings = Listing.objects.filter(seller=request.user)
        return Response(ListingSerializer(listings, many=True).data)


class ToggleFavouriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        try:
            listing = Listing.objects.get(pk=listing_id)
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"},
                status=404
            )

        favourite = Favourite.objects.filter(
            user=request.user,
            listing=listing
        ).first()

        if favourite:
            favourite.delete()

            return Response({
                "favourited": False
            })

        Favourite.objects.create(
            user=request.user,
            listing=listing
        )

        return Response({
            "favourited": True
        })

class FavouriteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favourites = Favourite.objects.filter(user=request.user).select_related('listing')

        data = []

        for fav in favourites:
            listing = fav.listing
            first_image = listing.images.first()

            data.append({
                "id": listing.id,
                "title": listing.title,
                "price": listing.price,
                "currency": getattr(listing, "currency", "AZN"),
                "location": listing.location,
                "condition": listing.condition,
                "category_name": listing.category.name if listing.category else "",
                "description": listing.description,
                "image": first_image.image.url if first_image else None,
            })

        return Response(data)