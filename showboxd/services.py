from django.db import transaction, IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from decimal import Decimal
from .models import (
    Media, Movie, TVShow, Season, Episode,
    Review, CastCrew, Showing, Booking, Users
)
class MediaService:
    @staticmethod
    def get_all_media(media_type=None):
        queryset = Media.objects.all()
        if media_type:
            queryset = queryset.filter(media_type=media_type)
        return queryset.order_by('-created_at')

    @staticmethod
    def get_full_details(media_id):
        """
        Robust Fetch: Gets Media and tries to find its child (Movie/TV).
        Using 'extra_details' as the key to match the view expectation.
        """
        try:
            media = Media.objects.get(pk=media_id)

            # Use filter().first() to avoid 'DoesNotExist' crashes
            extra = None
            if media.media_type == 'movie':
                extra = Movie.objects.filter(pk=media_id).first()
            else:
                extra = TVShow.objects.filter(pk=media_id).first()

            cast = CastCrew.objects.filter(media_id=media_id).select_related('person')
            reviews = Review.objects.filter(media_id=media_id).select_related('user')

            return {
                "media": media,
                "extra_details": extra, # Fixed key name
                "cast": cast,
                "reviews": reviews
            }
        except Media.DoesNotExist:
            return None
    @staticmethod
    def get_media(media_id):
        try:
            return Media.objects.get(pk = media_id)
        except Media.DoesNotExist:
            return None

class TVMetadataService:
    @staticmethod
    def get_episodes_for_season(season_id):
        return Episode.objects.filter(season_id = season_id).order_by('episode_number')

class ReviewService:
    @staticmethod
    def post_review(user_id, media_id, rating, review_text):
        # Triggers automatically update aggregate rating in Media model
        try:
            user = Users.objects.get(pk = user_id)
            review = Review.objects.create(
                media_id = media_id,
                user = user,
                rating=  Decimal(str(rating)),
                review_text = review_text
            )
            return review
        except Users.DoesNotExist:
            raise ValueError("User does not exist")
        except IntegrityError:
            # Handles unique constraint where user has already reviewd the mov/show
            raise ValueError("You have already reviewed this media")

class BookingService:
    @staticmethod
    @transaction.atomic
    # Either the booking is successful or it fails, we don't want partial updates
    def create_booking(user_id, showing_id, seats_requested):
        try:
            showing = Showing.objects.get(pk=showing_id)
            user = Users.objects.get(pk=user_id)
            calculated_total = showing.price * int(seats_requested)

            booking = Booking.objects.create(
                user=user,
                showing=showing,
                seats_booked=seats_requested,
                total_price=calculated_total,
                booking_status='confirmed'
            )
            return booking

        except Showing.DoesNotExist:
            raise ValueError("The show is no longer available.")
        except Users.DoesNotExist:
            raise ValueError("User does not exist.")
        except Exception as e:
            # Catches trigger exceptions like 'Not enough available seats'
            raise ValueError(str(e))

    @staticmethod
    def cancel_booking(booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id)
            if booking.booking_status == 'cancelled':
                raise ValueError("Booking is already cancelled.")

            booking.booking_status = 'cancelled'
            booking.save()
            return True
        except Booking.DoesNotExist:
            return False

    @staticmethod
    def get_showtimes_for_movie(movie_id):
        return Showing.objects.filter(media_id=movie_id).select_related('screen__cinema').order_by('show_date', 'show_time')
