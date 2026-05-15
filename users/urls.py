from django.urls import path
from .views import (register_api, me, logout_api, forgot_password,
                    reset_password, verify_email, update_profile, login_api,
                    change_password, admin_get_users, admin_toggle_user,
                    admin_get_listings, admin_remove_listing)

urlpatterns = [
    path('register/', register_api, name = 'register_api'),
    path('login/', login_api),
    path('me/', me),
    path('logout/', logout_api),
    path('forgot-password/', forgot_password),
    path('reset-password/', reset_password),
    path('verify-email/<uuid:token>/', verify_email),
    path('update/', update_profile),
    path('change-password/', change_password),
    #admin
    path('admin/users/', admin_get_users),
    path('admin/users/<int:user_id>/toggle/', admin_toggle_user),
    path('admin/listings/', admin_get_listings),
    path('admin/listings/<int:listing_id>/remove/', admin_remove_listing),
]