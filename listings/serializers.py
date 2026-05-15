from rest_framework import serializers
from .models import Listing, ListingImage, Category, Favourite


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image', 'uploaded_at']


class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'seller', 'seller_username', 'title', 'description',
            'price', 'category', 'category_name', 'condition', 'location', 'contact_phone',
            'status', 'images', 'uploaded_images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['seller', 'status', 'created_at', 'updated_at']

    def validate_uploaded_images(self, images):
        if len(images) > 5:
            raise serializers.ValidationError("Maximum 5 images allowed.")
        return images

    def create(self, validated_data):
        images = validated_data.pop('uploaded_images', [])
        listing = Listing.objects.create(**validated_data)
        for image in images:
            ListingImage.objects.create(listing=listing, image=image)
        return listing

    def update(self, instance, validated_data):
        images = validated_data.pop('uploaded_images', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        for image in images:
            ListingImage.objects.create(listing=instance, image=image)
        return instance


class FavouriteSerializer(serializers.ModelSerializer):
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_price = serializers.DecimalField(source='listing.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Favourite
        fields = ['id', 'listing', 'listing_title', 'listing_price', 'saved_at']
        read_only_fields = ['saved_at']