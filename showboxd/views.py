from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import (
    MediaDTO, ReviewDTO, TVShowDTO,
    CastCrewDTO, MovieDTO, GenreDTO
)
from .services import BookingService, MediaService, PlatformService, RecommendationService, ReviewInteractionService, ReviewService, TVMetadataService, WatchHistoryServices, WatchListService
from .authentication import create_user, verify_jwt_token, generate_jwt_token
from django.contrib.auth.hashers import make_password, check_password
from .models import Episode, Season, Users
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache
from .validators import validate_required_fields, validate_rating, validate_media_type

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10000
    page_size_query_param = 'page_size'
    max_page_size = 100000

@api_view(['GET'])
def get_media_catalog(request):
    media_type = request.query_params.get('type')
    media_list = MediaService.get_all_media(media_type=media_type)

    paginatior= StandardResultsSetPagination()
    paginated_media= paginatior.paginate_queryset(media_list, request)

    serializer= MediaDTO(paginated_media, many=True)
    return paginatior.get_paginated_response(serializer.data)



@api_view(['GET'])
def search_media(request):
    """
    Query 15 (title ILIKE) + Query 2 (genre) + Query 3 (top rated).
    GET /api/search/?q=inception&type=movie&genre=Thriller&top_rated=true
    """
    query      = request.query_params.get('q', '')
    media_type = request.query_params.get('type', '')
    genre      = request.query_params.get('genre', '')
    top_rated  = request.query_params.get('top_rated', '').lower() == 'true'

    results = MediaService.search_media(
        query=query or None,
        media_type=media_type or None,
        genre=genre or None,
        top_rated=top_rated,
    )
    # Raw SQL returns list of dicts; ORM fallback returns a queryset
    if isinstance(results, list):
        return Response(results)
    return Response(MediaDTO(results, many=True).data)


@api_view(['GET'])
def get_genres(request):
    genres = MediaService.get_all_genres()
    return Response(GenreDTO(genres, many=True).data)


@api_view(['GET'])
def get_media_details(request, media_id):
    data = MediaService.get_full_details(media_id)
    if not data:
        return Response({"error": "Media not found"}, status=status.HTTP_404_NOT_FOUND)

    extra_data = None
    if data['extra_details']:
        if data['media'].media_type == 'tv_show':
            extra_data = TVShowDTO(data['extra_details']).data
        else:
            extra_data = MovieDTO(data['extra_details']).data

    return Response({
        "details": MediaDTO(data['media']).data,
        "extra":   extra_data,
        "cast":    CastCrewDTO(data['cast'], many=True).data,
        # raw_reviews is already a list of dicts from Query 9 raw SQL
        "reviews": data['raw_reviews'],
    })


@api_view(['POST'])
def submit_review(request):
    validation_error = validate_required_fields(request.data, ['user_id', 'media_id', 'rating'])
    if validation_error:
        return validation_error
    rating_error = validate_rating(request.data['rating'])
    if rating_error:
        return rating_error
    try:
        review = ReviewService.post_review(
            user_id=request.data['user_id'],
            media_id=request.data['media_id'],
            rating=request.data['rating'],
            review_text=request.data.get('review_text', '')
        )
        return Response(ReviewDTO(review).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ── Booking endpoints ──────────────────────────────────────────────────────

@api_view(['GET'])
def get_movie_showtimes(request, movie_id):
    # Query 5 — raw SQL, returns list of dicts directly
    showings = BookingService.get_showtimes_for_movie(movie_id)
    return Response(showings)


@api_view(['POST'])
def create_ticket_booking(request):
    try:
        BookingService.create_booking(
            user_id         = request.data.get('user_id'),
            showing_id      = request.data.get('showing_id'),
            seats_requested = request.data.get('seats_booked'),
        )
        return Response({"status": "success"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def cancel_ticket_booking(request, booking_id):
    success = BookingService.cancel_booking(booking_id)
    if success:
        return Response({"message": "Booking cancelled successfully"})
    return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_user_bookings(request, user_id):
    # Query 7 — raw SQL, returns list of dicts directly
    bookings = BookingService.get_user_bookings(user_id)
    return Response(bookings)

@api_view(['POST'])
def register(request):
    try:
        user=create_user(
            name=request.data.get('name'),
            email=request.data.get('email'),
            password=request.data.get('password'),
            region=request.data.get('region'),
            preferred_language=request.data.get('preferred_language')
        )
        token = generate_jwt_token(user)
        return Response({
            "user_id": user.user_id,
            "token": token,
            'message': "User registered successfully"
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    try:
        user = Users.objects.get(email=email)
        if check_password(password, user.password_hash):
            token = generate_jwt_token(user)
            return Response({
                "user_id": user.user_id,
                "token": token,
                'email': user.email,
                'name': user.name,
                'role': user.role
            })
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    except Users.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout(request):
    # Since we're using JWTs, logout can be handled client-side by deleting the token.
    # Optionally, we could implement token blacklisting here if needed.
    return Response({"message": "Logout successful. Please delete the token on the client side."})

@api_view(['GET'])
def verify_token_view(request):
    auth_header=request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({"error": "Authorization header missing or invalid"}, status=status.HTTP_401_UNAUTHORIZED)
    token= auth_header.split(' ')[1]
    user = verify_jwt_token(token)

    if user:
        return Response({
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_verified": user.is_verified
        })
    return Response({"error": "Invalid or expired token"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def add_to_watchlist(request):
    try:
        WatchListService.add_to_watchlist(
            user_id     = request.data.get('user_id'),
            media_id    = request.data.get('media_id'),
            visibility  = request.data.get('visibility', 'private')

        )
        return Response({"status": "success"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_from_watchlist(request):
    success = WatchListService.remove_from_watchlist(
        user_id=request.data.get('user_id'),
        media_id=request.data.get('media_id'),
        visibility=request.data.get('visibility', 'private')
    )
    if success:
        return Response({"message": "Removed from watchlist successfully"})
    return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_my_watchlist(request, user_id, visibility):
    """Get user's own watchlist (private or public)"""
    items = WatchListService.get_watchlist_items(user_id, visibility)
    return Response(items)

@api_view(['GET'])
def get_user_public_watchlist(request, user_id):
    """Get another user's public watchlist"""
    items = WatchListService.get_public_watchlist(user_id)
    return Response(items)

@api_view(['POST'])
def record_watch(request):
    try:
        WatchHistoryServices.record_watch(
            user_id=request.data.get('user_id'),
            media_id=request.data.get('media_id'),
            episode_id=request.data.get('episode_id')
        )
        return Response({'status':'success'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error':str(e)}, status = status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def get_watch_history(request, user_id):
    limit = request.query_params.get('limit', 50)
    history = WatchHistoryServices.get_watch_history(user_id, int(limit))

    return Response(history)

@api_view(['POST'])
def like_review(request):
    try:
        ReviewInteractionService.like_review(
            user_id=request.data.get('user_id'),
            review_id=request.data.get('review_id')
        )
        return Response({'status':'success'}, status= status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error':str(e)}, status = status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def unlike_review(request):
    success= ReviewInteractionService.unlike_review(
        user_id = request.data.get('user_id'),
        review_id = request.data.get('review_id')
    )
    if success:
        return Response({'message':'Review Unliked Successfully'}, status=status.HTTP_200_OK)
    return Response({'error':'Like not found'}, status = status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_trending(request):
    cache_key = 'trending_media'
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)
    trending= RecommendationService.get_trending_media()
    cache.set(cache_key, trending, timeout=900)  # Cache for 15 minutes
    return Response(trending)

@api_view(['GET'])
def get_recommendations(request, user_id):
    recommendations = RecommendationService.get_recommendation_for_user(user_id)
    return Response(recommendations)

@api_view(['GET'])
def get_user_watch_history(request, user_id):
    limit = request.query_params.get('limit',50)
    history=WatchHistoryServices.get_watch_history(user_id,int(limit))
    return Response(history)

@api_view(['GET'])
def get_similar_media(request,media_id):
    limit=request.query_params.get('limit', 10)
    similar=RecommendationService.get_similar_media(media_id,int(limit))
    return Response(similar)

@api_view(['GET'])
def get_tv_show_seasons(request, media_id):
    seasons = TVMetadataService.get_all_seasons_for_show(media_id)
    return Response(seasons)

@api_view(['GET'])
def get_season_details(request, season_id):
    try:
        season_data = TVMetadataService.get_seasons_with_episodes(season_id)
        return Response(season_data)
    except Season.DoesNotExist:
        return Response({"error": "Season not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_next_episode(request, episode_id):
    try:
        current_episode= Episode.objects.get(pk=episode_id)
        next_ep=TVMetadataService.get_next_episode(
            current_episode.media_id,
            episode_id
        )
        if next_ep:
            return Response({
                "episode_id": next_ep.episode_id,
                "title": next_ep.title,
                "season_number": next_ep.season.season_number,
                "episode_number": next_ep.episode_number,

            })
        return Response({'message': 'No next episode found'}, status=status.HTTP_404_NOT_FOUND)
    except Episode.DoesNotExist:
        return Response({"error": "Episode not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_media_platforms(request, media_id):
    region= request.query_params.get('region')
    platforms=PlatformService.get_platforms_for_media(media_id,region)
    return Response(platforms)

@api_view(['GET'])
def get_platform_content(request, platform_id):
    region = request.query_params.get('region')
    media_types = request.query_params.getlist('type')
    content = PlatformService.get_content_for_platform(platform_id, region, media_types)
    return Response(content)

