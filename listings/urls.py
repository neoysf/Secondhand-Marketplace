from django.urls import path
from . import views
from .views import ToggleFavouriteView, FavouriteListView

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('', views.ListingListCreateView.as_view(), name='listing-list-create'),
    path('<int:pk>/', views.ListingDetailView.as_view(), name='listing-detail'),
    path('<int:pk>/sold/', views.MarkAsSoldView.as_view(), name='listing-mark-sold'),
    path('<int:pk>/favourite/', views.FavouriteToggleView.as_view(), name='favourite-toggle'),
    path('favourites/', views.FavouriteListView.as_view(), name='favourite-list'),
    path('my/', views.MyListingsView.as_view(), name='my-listings'),
    path('favourites/', FavouriteListView.as_view()),
    path('<int:listing_id>/favourite/', ToggleFavouriteView.as_view()),
]