import jwt
import os
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()

class SupabaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        print(f"DEBUG: Authorization Header present: {bool(auth_header)}")
        if not auth_header:
            return None

        try:
            token = auth_header.split(' ')[1]
        except (IndexError, AttributeError):
            return None

        # Reload settings to ensure we have the latest .env
        secret = os.environ.get('SUPABASE_JWT_SECRET')
        print(f"DEBUG: Authenticating request. Secret found: {bool(secret)}")
        if not secret:
            print("ERROR: SUPABASE_JWT_SECRET not found in environment!")
            return None

        # Supabase secrets are often base64 encoded
        import base64
        try:
            # Check if it looks like base64
            if len(secret) % 4 == 0 and all(c in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" for c in secret):
                decoded_secret = base64.b64decode(secret)
                print("DEBUG: Secret successfully base64 decoded.")
            else:
                decoded_secret = secret
        except Exception as e:
            print(f"DEBUG: Base64 decode failed: {e}")
            decoded_secret = secret

        try:
            # Debug: See what algorithm is being used
            header = jwt.get_unverified_header(token)
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            print(f"DEBUG: JWT Header: {header}")
            print(f"DEBUG: Unverified Payload: {unverified_payload}")

            # Force algorithm to HS256 if the secret is a symmetric key
            # If the header says ES256 but we have a symmetric secret, something is wrong.
            # But let's try to decode with the decoded secret.
            payload = jwt.decode(
                token, 
                key=decoded_secret, 
                algorithms=["HS256", "ES256"],
                options={"verify_aud": False}
            )
            print(f"DEBUG: JWT Payload: {payload}")
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
