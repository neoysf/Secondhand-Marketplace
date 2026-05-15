from django.urls import path
from .views import ReviewCreateView, SellerProfileView

urlpatterns = [
    path('<int:seller_id>/review/', ReviewCreateView.as_view(), name='review-create'),
    path('<int:seller_id>/profile/', SellerProfileView.as_view(), name='seller-profile'),
]