import jwt
import os
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()

class SupabaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        try:
            token = auth_header.split(' ')[1]
        except (IndexError, AttributeError):
            return None

        secret = os.environ.get('SUPABASE_JWT_SECRET')
        if not secret:
            return None

        try:
            payload = jwt.decode(
                token, 
                key=secret, 
                algorithms=["HS256", "ES256"],
                audience="authenticated"
            )
        except Exception as e:
            raise exceptions.AuthenticationFailed('Invalid token')

        email = payload.get('email')
        if not email:
            return None
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create(
                username=email.split('@')[0], 
                email=email,
                role=payload.get('user_metadata', {}).get('role', 'creator')
            )

        return (user, None)
