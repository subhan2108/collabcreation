import jwt
import os
from django.conf import settings
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

        # Reload settings to ensure we have the latest .env
        secret = os.environ.get('SUPABASE_JWT_SECRET')
        if not secret:
            return None

        try:
            # Debug: See what algorithm is being used
            header = jwt.get_unverified_header(token)
            print(f"DEBUG: JWT Header: {header}")

            # Supabase might be using HS256 (Legacy) or ES256 (New)
            payload = jwt.decode(
                token, 
                key=secret, 
                algorithms=["HS256", "ES256", "RS256"],
                audience="authenticated"
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except Exception as e:
            # Log the specific error for debugging if needed
            print(f"JWT Verification Failed: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Invalid token')

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
