from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import (
    MediaDTO, UserDTO, ReviewDTO, TVShowDTO,
    CastCrewDTO, MovieDTO, BookingDTO
)

from .services import BookingService, MediaService, TVMetadataService, ReviewService
@api_view(['GET'])
def get_media_catalog(request):
    media_type= request.query_params.get('type')
    media_list = MediaService.get_all_media(media_type=media_type)
    serializer = MediaDTO(media_list, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_media_details(request, media_id):
    data = MediaService.get_full_details(media_id)
    if not data:
        return Response({"error": "Media not found"},404)
    return Response({
        "details": MediaDTO(data['media']).data,
        "extra": TVShowDTO(data['extra_details']).data if data['media'].media_type == 'tv_show' else MovieDTO(data['extra_details']).data,
        "cast": CastCrewDTO(data['cast'], many=True).data,
        "reviews": ReviewDTO(data['reviews'], many=True).data
    })
@api_view(['POST'])
def submit_review(request):
    try:
        review= ReviewService.post_review(
            user_id = request.data.get('user_id'),
            media_id = request.data.get('media_id'),
            rating = request.data.get('rating'),
            review_text = request.data.get('review_text', '')

        )
        return Response(ReviewDTO(review).data, status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#Booking endpoints
@api_view(['GET'])
def get_movie_showtimes(request, movie_id):
    showings=BookingService.get_showtimes_for_movie(movie_id)
    return Response(BookingDTO(showings, many=True).data)
@api_view(['POST'])
def create_ticket_booking(request):
    try:
        booking= BookingService.create_booking(
            user_id = request.data.get('user_id'),
            showing_id=request.data.get('showing_id'),
            seats= request.data.get('seats_booked')
        )
        return Response(BookingDTO(booking).data, status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['PATCH'])
def cancel_ticket_booking(request, booking_id):
    success = BookingService.cancel_booking(booking_id)
    if success:
        return Response({"message": "Booking cancelled successfully"})
    else:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)