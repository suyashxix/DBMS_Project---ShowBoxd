from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import (
    MediaDTO, ReviewDTO, TVShowDTO,
    CastCrewDTO, MovieDTO, GenreDTO
)
from .services import BookingService, MediaService, ReviewService


@api_view(['GET'])
def get_media_catalog(request):
    media_type = request.query_params.get('type')
    media_list = MediaService.get_all_media(media_type=media_type)
    return Response(MediaDTO(media_list, many=True).data)


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
    try:
        review = ReviewService.post_review(
            user_id     = request.data.get('user_id'),
            media_id    = request.data.get('media_id'),
            rating      = request.data.get('rating'),
            review_text = request.data.get('review_text', '')
        )
        return Response(ReviewDTO(review).data, status=status.HTTP_201_CREATED)
    except ValueError as e:
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