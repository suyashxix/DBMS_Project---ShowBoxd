from rest_framework import serializers
from .models import (Booking, Showing, Screen, Users, Media, Movie, TVShow, Genre, Person, CastCrew, Review)

class UserDTO(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['user_id', 'name', 'email', 'region', 'preferred_language', 'role', 'created_at']

class GenreDTO(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class MediaDTO(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = '__all__'

class MovieDTO(serializers.ModelSerializer):
    media = MediaDTO(read_only=True)
    class Meta:
        model = Movie
        fields = '__all__'

class TVShowDTO(serializers.ModelSerializer):
    media = MediaDTO(read_only=True)
    class Meta:
        model = TVShow
        fields = '__all__'

class PersonDTO(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

class CastCrewDTO(serializers.ModelSerializer):
    person = PersonDTO(read_only=True)
    media = MediaDTO(read_only=True)
    class Meta:
        model = CastCrew
        fields = '__all__'

class ReviewDTO(serializers.ModelSerializer):
    user = UserDTO(read_only=True)
    class Meta:
        model = Review
        fields = ['review_id', 'rating', 'review_text', 'review_date', 'created_at', 'user']

class UserLiteDTO(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['user_id', 'name', 'email']

class MediaLiteDTO(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['media_id', 'title', 'poster_url', 'aggregate_rating']

class PersonLiteDTO(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ['person_id', 'name', 'profile_image_url']

class ScreenWithCinemaDTO(serializers.ModelSerializer):
    cinema_name     = serializers.CharField(source='cinema.name',     read_only=True)
    cinema_location = serializers.CharField(source='cinema.city',     read_only=True)
    class Meta:
        model  = Screen
        fields = ['screen_name', 'screen_type', 'cinema_name', 'cinema_location']

class ShowingDTO(serializers.ModelSerializer):
    screen = ScreenWithCinemaDTO(read_only=True)
    class Meta:
        model  = Showing
        fields = ['showing_id', 'show_date', 'show_time', 'available_seats', 'price', 'screen']

class BookingDTO(serializers.ModelSerializer):
    class Meta:
        model  = Booking
        fields = ['booking_id', 'user', 'showing', 'seats_booked', 'total_price', 'booking_time']
        read_only_fields = ['total_price', 'booking_time']

class BookingDetailDTO(serializers.ModelSerializer):
    """Rich booking serializer for the My Bookings page — nests showing → screen → cinema + media info."""
    showing       = ShowingDTO(read_only=True)
    media_id      = serializers.IntegerField(source='showing.media.media.media_id', read_only=True)
    media_title   = serializers.CharField(source='showing.media.media.title',       read_only=True)
    poster_url    = serializers.CharField(source='showing.media.media.poster_url',  read_only=True)
    class Meta:
        model  = Booking
        fields = [
            'booking_id', 'seats_booked', 'total_price', 'booking_time', 'booking_status',
            'showing', 'media_id', 'media_title', 'poster_url',
        ]