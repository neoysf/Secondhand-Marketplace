from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives
from .models import User, EmailVerificationToken
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse
from .models import PasswordResetToken
from .permissions import IsAdmin
from listings.models import Listing
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['POST'])
def register_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password or not email:
        return Response({"error": "All fields are required"})
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"})
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"})

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )
    token = EmailVerificationToken.objects.create(user=user)
    verification_link = f"http://127.0.0.1:8000/api/users/verify-email/{token.token}/"

    html_content = render_to_string(
        'emails/verify_email.html',
        {
            'username': username,
            'verification_link': verification_link
        }
    )

    text_content = strip_tags(html_content)

    email_message = EmailMultiAlternatives(
        subject='Verify your account',
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[email],
    )

    email_message.attach_alternative(html_content, "text/html")
    email_message.send()

    return Response({
        'message': 'User created. Check your email to verify.',
        'username': user.username,
        'email': user.email,
        'verification_link': verification_link
    })

@api_view(['POST'])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"})
    if not user.is_verified:
        return Response({"error": "Please verify your email first"})
    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    return Response({
        "username": user.username,
        "role": user.role,
        "email": user.email,
        "phone": user.phone,
        "location": user.location,
        "bio": user.bio,
        "avatar": user.avatar.url if user.avatar else None
    })

@api_view(['POST'])
def logout_api(request):
    return Response({"message": "Logged out"})

@api_view(['POST'])
def forgot_password(request):
    username = request.data.get('username')

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"})

    token = PasswordResetToken.objects.create(user=user)

    return Response({
        "message": "Reset token created",
        "token": str(token.token)
    })

@api_view(['POST'])
def reset_password(request):
    token = request.data.get('token')
    new_password = request.data.get('password')

    try:
        reset = PasswordResetToken.objects.get(token=token)
    except PasswordResetToken.DoesNotExist:
        return Response({"error": "Invalid token"})

    user = reset.user
    user.set_password(new_password)
    user.save()
    reset.delete()
    return Response({"message": "Password updated"})

@api_view(['GET'])
def verify_email(request, token):
    try:
        verification = EmailVerificationToken.objects.get(token=token)
    except EmailVerificationToken.DoesNotExist:
        return Response({"error": "Invalid token"})

    user = verification.user
    user.is_verified = True
    user.save()

    verification.delete()

    return HttpResponse("Email verified successfully!")

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    user = request.user
    username = request.data.get('username')
    role = request.data.get('role')
    phone = request.data.get('phone')
    location = request.data.get('location')
    bio = request.data.get('bio')
    avatar = request.FILES.get('avatar')

    if avatar:
        user.avatar = avatar
    if username:
        user.username = username
    if role:
        user.role = role
    if phone:
        user.phone = phone
    if location:
        user.location = location
    if bio:
        user.bio = bio
    user.save()

    return Response({
        "message": "Profile updated",
        "username": user.username,
        "role": user.role,
        "phone": user.phone,
        "location": user.location,
        "bio": user.bio,
        "avatar": user.avatar.url if user.avatar else None
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user

    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({"error": "Both fields are required"})
    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect"})
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password updated successfully"})

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_get_users(request):
    users = User.objects.all()
    data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_verified": u.is_verified,
            "is_active": u.is_active,
        }
        for u in users
    ]
    return Response(data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_toggle_user(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    user.is_active = not user.is_active
    user.save()
    return Response({
        "message": f"User {'activated' if user.is_active else 'deactivated'}",
        "is_active": user.is_active
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_remove_listing(request, listing_id):
    try:
        listing = Listing.objects.get(pk=listing_id)
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found"}, status=404)

    listing.status = 'removed'
    listing.save()
    return Response({"message": "Listing removed by admin"})

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_get_listings(request):
    listings = Listing.objects.all()
    data = [
        {
            "id": l.id,
            "title": l.title,
            "seller": l.seller.username,
            "status": l.status,
            "price": l.price,
            "created_at": l.created_at,
        }
        for l in listings
    ]
    return Response(data)
