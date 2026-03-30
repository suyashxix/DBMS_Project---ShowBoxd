from django.contrib.auth.hashers import make_password, check_password
from .models import Users
import jwt
from datetime import datetime, timedelta
from django.conf import settings

def create_user(name, email,password, region, preferred_language= None):
    user = Users.objects.create(
        name=name,
        email=email,
        password_hash=make_password(password),
        region=region,
        preferred_language=preferred_language,
        is_verified=False,
        role='user'
    )
    return user

def generate_jwt_token(user):
    payload={
        'user_id': user.user_id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user = Users.objects.get(pk = payload['user_id'])
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Users.DoesNotExist:
        return None

