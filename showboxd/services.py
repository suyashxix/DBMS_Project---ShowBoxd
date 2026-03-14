from django.core.exceptions import transaction, ObjectDoesNotExist
from django.db import IntegrityError
from .models import CastCrew, Users, Media, Review, Booking, Showing, Movie, TVShow, Season,Episode
from decimal import Decimal

class MediaService:
    @staticmethod
    def get_all_media(media_type=None):
        if media_type:
            return Movie.objects.filter(media_type=media_type).order_by('-created_at')
        return Movie.objects.all().order_by('-created_at')

    @staticmethod
    def get_full_details(media_id):
        try:
            media = Media.objects.get(pk = media_id)
            #Since we have tvshows and movies we need extra space for certain metadata
            extra_details = None
            if media.media_type == 'movie':
                extra_details = Movie.objects.get( pk = media_id)
            elif media.media_type == 'tv_show':
                extra_details = TVShow.objects.get(pk = media_id)
            cast = CastCrew.objects.filter(media_id = media_id).select_related('person')
            reviews = Review.objects.filter(media_id = media_id).selecy_related('user')
            return{
                "media":media,
                "extra_details": extra_details,
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
    # Either the booking is successful or it fails, we don't want partial updates'
    def create_booking(user_id, showing_id, seats_requested):
        #Validate total price via trigger trg_validate_booking_price
        # Decrements available seats via trigger trg_decrement_seats
        try:
            showing = Showing.objects.get(pk = showing_id)
            user = Users.objects.get(pk = user_id)
            calculated_total=  showing.price*seats_requested
            booking = Booking.objects.create(
                user = user,
                showing = showing,
                seats_booked = seats_requested,
                total_price = calculated_total,
                booking_status = 'confirmed'
            )
            return booking
        except Showing.DoesNotExist:
            raise ValueError("The show is no longer available")
        except Exception as e:
            raise ValueError(str(e))

    @staticmethod
    def cancel_booking(booking_id):
        try:
            booking = Booking.objects.get(pk = booking_id)
            if booking.booking_status == 'cancelled':
                raise ValueError("Booking is already cancelled")
            booking.booking_status = 'cancelled'
            booking.save()
            return True
        except Booking.DoesNotExist:
            return False