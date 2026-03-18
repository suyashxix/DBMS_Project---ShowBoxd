from django.db import transaction, IntegrityError, connection
from decimal import Decimal
from .models import (
    Media, Movie, TVShow, Season, Episode,
    Review, CastCrew, Showing, Booking, Users, Genre
)


def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dicts."""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


class MediaService:

    @staticmethod
    def get_all_media(media_type=None):
        queryset = Media.objects.all()
        if media_type:
            queryset = queryset.filter(media_type=media_type)
        return queryset.order_by('-created_at')

    @staticmethod
    def search_media(query=None, media_type=None, genre=None, top_rated=False):
        """
        Uses raw SQL matching the PDF queries:
          - Query 3:  Top 10 rated with >= 50 reviews
          - Query 2:  Browse by genre, sorted by rating DESC
          - Query 15: Partial title search (ILIKE)
        """

        # ── Query 3: Top rated ──────────────────────────────────────────────
        if top_rated:
            sql = """
                SELECT media_id, title, media_type, aggregate_rating,
                       total_reviews, language, poster_url, release_date,
                       description, created_at
                FROM media
                WHERE aggregate_rating IS NOT NULL
                  AND total_reviews >= 50
                ORDER BY aggregate_rating DESC, total_reviews DESC
                LIMIT 10
            """
            params = []
            if media_type:
                sql = sql.replace(
                    "AND total_reviews >= 50",
                    "AND total_reviews >= 50 AND media_type = %s"
                )
                params.append(media_type)
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                return dictfetchall(cursor)

        # ── Query 2: Browse by genre ─────────────────────────────────────────
        if genre and not query:
            sql = """
                SELECT m.media_id, m.title, m.media_type, m.aggregate_rating,
                       m.total_reviews, m.language, m.poster_url,
                       m.release_date, m.description, m.created_at
                FROM media m
                JOIN media_genre mg ON m.media_id = mg.media_id
                JOIN genre g        ON mg.genre_id = g.genre_id
                WHERE g.genre_name = %s
            """
            params = [genre]
            if media_type:
                sql += " AND m.media_type = %s"
                params.append(media_type)
            sql += " ORDER BY m.aggregate_rating DESC NULLS LAST"
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                return dictfetchall(cursor)

        # ── Query 15: Title search (ILIKE) ───────────────────────────────────
        if query:
            sql = """
                SELECT media_id, title, media_type, aggregate_rating,
                       total_reviews, language, poster_url, release_date,
                       description, created_at
                FROM media
                WHERE title ILIKE %s
            """
            params = [f'%{query}%']
            if media_type:
                sql += " AND media_type = %s"
                params.append(media_type)
            if genre:
                sql = sql.replace("FROM media", """
                    FROM media
                    JOIN media_genre mg ON media.media_id = mg.media_id
                    JOIN genre g        ON mg.genre_id = g.genre_id
                """)
                sql += " AND g.genre_name = %s"
                params.append(genre)
            sql += " ORDER BY aggregate_rating DESC NULLS LAST"
            with connection.cursor() as cursor:
                cursor.execute(sql, params)
                return dictfetchall(cursor)

        # ── Default catalog (no filters) — return ORM queryset for serializer ─
        qs = Media.objects.all()
        if media_type:
            qs = qs.filter(media_type=media_type)
        return qs.order_by('-created_at')

    @staticmethod
    def get_full_details(media_id):
        try:
            media   = Media.objects.get(pk=media_id)
            extra   = None
            if media.media_type == 'movie':
                extra = Movie.objects.filter(pk=media_id).first()
            else:
                extra = TVShow.objects.filter(pk=media_id).first()

            cast = CastCrew.objects.filter(media_id=media_id).select_related('person')

            # ── Query 9: Reviews — verified users first, then by likes & date ─
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT r.review_id, u.name, u.is_verified,
                           r.rating, r.review_text, r.review_date,
                           COUNT(rl.user_id) AS like_count,
                           r.created_at
                    FROM review r
                    JOIN users u        ON r.user_id = u.user_id
                    LEFT JOIN review_like rl ON r.review_id = rl.review_id
                    WHERE r.media_id = %s
                    GROUP BY r.review_id, u.name, u.is_verified,
                             r.rating, r.review_text, r.review_date, r.created_at
                    ORDER BY u.is_verified DESC, like_count DESC, r.review_date DESC
                """, [media_id])
                raw_reviews = dictfetchall(cursor)

            return {
                "media":         media,
                "extra_details": extra,
                "cast":          cast,
                "raw_reviews":   raw_reviews,
            }
        except Media.DoesNotExist:
            return None

    @staticmethod
    def get_media(media_id):
        try:
            return Media.objects.get(pk=media_id)
        except Media.DoesNotExist:
            return None

    @staticmethod
    def get_all_genres():
        return Genre.objects.all().order_by('genre_name')


class TVMetadataService:
    @staticmethod
    def get_episodes_for_season(season_id):
        return Episode.objects.filter(season_id=season_id).order_by('episode_number')


class ReviewService:
    @staticmethod
    def post_review(user_id, media_id, rating, review_text):
        # Query 10 — triggers fire to update aggregate_rating and total_reviews
        try:
            user = Users.objects.get(pk=user_id)
            review = Review.objects.create(
                media_id=media_id,
                user=user,
                rating=Decimal(str(rating)),
                review_text=review_text,
            )
            return review
        except Users.DoesNotExist:
            raise ValueError("User does not exist")
        except IntegrityError:
            raise ValueError("You have already reviewed this media")


class BookingService:

    @staticmethod
    @transaction.atomic
    def create_booking(user_id, showing_id, seats_requested):
        # Query 6 — trg_validate_booking_price fires BEFORE, trg_decrement_seats AFTER
        try:
            showing          = Showing.objects.get(pk=showing_id)
            user             = Users.objects.get(pk=user_id)
            calculated_total = showing.price * int(seats_requested)
            booking = Booking.objects.create(
                user=user,
                showing=showing,
                seats_booked=seats_requested,
                total_price=calculated_total,
                booking_status='confirmed',
            )
            return booking
        except Showing.DoesNotExist:
            raise ValueError("The show is no longer available.")
        except Users.DoesNotExist:
            raise ValueError("User does not exist.")
        except Exception as e:
            raise ValueError(str(e))

    @staticmethod
    def cancel_booking(booking_id):
        # Query 8 — trigger fires to return seats to available_seats
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
        # Query 5 — showtimes for a specific movie
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT sh.showing_id, m.title,
                       c.name  AS cinema_name, c.city AS cinema_location,
                       sc.screen_name, sc.screen_type,
                       sh.show_date, sh.show_time,
                       sh.available_seats, sh.price
                FROM showing sh
                JOIN screen sc  ON sh.screen_id  = sc.screen_id
                JOIN cinema c   ON sc.cinema_id   = c.cinema_id
                JOIN movie mo   ON sh.media_id    = mo.media_id
                JOIN media m    ON mo.media_id     = m.media_id
                WHERE mo.media_id = %s
                  AND sh.available_seats > 0
                ORDER BY sh.show_date, sh.show_time
            """, [movie_id])
            return dictfetchall(cursor)

    @staticmethod
    def get_user_bookings(user_id):
        # Query 7 — full booking history
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT b.booking_id,
                       m.media_id,
                       m.title        AS media_title,
                       m.poster_url,
                       c.name         AS cinema_name,
                       c.city         AS cinema_location,
                       sc.screen_name,
                       sh.showing_id,
                       sh.show_date,
                       sh.show_time,
                       b.seats_booked,
                       b.total_price,
                       b.booking_status,
                       b.booking_time
                FROM booking b
                JOIN showing sh ON b.showing_id  = sh.showing_id
                JOIN screen sc  ON sh.screen_id   = sc.screen_id
                JOIN cinema c   ON sc.cinema_id   = c.cinema_id
                JOIN movie mo   ON sh.media_id    = mo.media_id
                JOIN media m    ON mo.media_id     = m.media_id
                WHERE b.user_id = %s
                ORDER BY b.booking_time DESC
            """, [user_id])
            return dictfetchall(cursor)