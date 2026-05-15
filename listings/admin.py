from django.contrib import admin
from .models import Category, Listing, ListingImage, Favourite


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1
    min_num = 0
    max_num = 5


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'category', 'price', 'condition', 'location', 'contact_phone', 'status', 'created_at')
    list_filter = ('category', 'condition', 'status')
    search_fields = ('title', 'description', 'location', 'contact_phone')
    inlines = [ListingImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ('listing', 'uploaded_at')


@admin.register(Favourite)
class FavouriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'saved_at')