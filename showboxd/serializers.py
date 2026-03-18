from rest_framework import serializers
from .models import (Booking, Users, Media, Movie, TVShow, Genre, Person, CastCrew, Review )

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
    media = MediaDTO(read_only=True)
    class Meta:
        model = Review
        fields = '__all__'

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

class BookingDTO(serializers.Serializer):
    class Meta:
        model = Booking
        fields = ['booking_id', 'user', 'showing', 'seats_booked', 'total_price','booking_time']
        read_only_fields = ['total_price', 'booking_time']