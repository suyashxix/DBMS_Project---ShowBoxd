from rest_framework.response import Response
from rest_framework import status

def validate_required_fields(data, required_fields):
    missing_fields= [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        return Response({"error": f"Missing required fields: {','.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

    return None

def validate_rating(rating):
    try:
        rating_val = float(rating)
        if not 0 <= rating_val <= 10:
            return Response({"error": "Rating must be between 0 and 10"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Invalid rating format"}, status=status.HTTP_400_BAD_REQUEST)
    return None
def validate_media_type(media_type):
    valid_types = ['tv_show', 'movie']
    if media_type not in valid_types:
        return Response({"error": "Invalid media type. Must be one of 'tv_show' or 'movie'"}, status=status.HTTP_400_BAD_REQUEST)

    return None