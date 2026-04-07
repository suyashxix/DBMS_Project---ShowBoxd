from django.db import transaction, IntegrityError, connection
from decimal import Decimal
from .models import (
    Media, Movie, ReviewLike, TVShow, Season, Episode,
    Review, CastCrew, Showing, Booking, Users, Genre, WatchHistory, Watchlist, WatchlistItem
)
import logging
logger = logging.getLogger(__name__)

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

            #Reviews listed by verified users first, then by likes & date ─
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



class ReviewService:
    @staticmethod
    def post_review(user_id, media_id, rating, review_text):
        #triggers fire to update aggregate_rating and total_reviews
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
        # trg_validate_booking_price fires BEFORE, trg_decrement_seats AFTER
        logger.info(f"Creating booking for user {user_id}, showing {showing_id}")
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
            logger.info(f"Booking created successfully: {booking.booking_id}")
            return booking
        except Showing.DoesNotExist:
            logger.error(f"Booking failed: Showing {showing_id} is no longer available", exc_info=True)
            raise ValueError("The show is no longer available.")
        except Users.DoesNotExist:
            logger.error(f"Booking failed: User {user_id} does not exist", exc_info=True)
            raise ValueError("User does not exist.")
        except Exception as e:
            logger.error(f"Booking failed: {str(e)}", exc_info=True)
            raise ValueError(str(e))

    @staticmethod
    def cancel_booking(booking_id):
        #Triggers trg_increment_seats to add back the seats to showing
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
                JOIN screen sc  ON sh.screen_id= sc.screen_id
                JOIN cinema c   ON sc.cinema_id= c.cinema_id
                JOIN movie mo   ON sh.media_id = mo.media_id
                JOIN media m    ON mo.media_id = m.media_id
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

class WatchListService:
    @staticmethod
    def get_or_create_user_watchlist(user_id):
        user=Users.objects.get(pk=user_id)
        private_watchlist, _ = Watchlist.objects.get_or_create(
            user=user,
            visibility='private',
            defaults={'name': f"{user.name}'s Private Watchlist"}
        )

        public_watchlist, _ = Watchlist.objects.get_or_create(
            user=user,
            visibility='public',
            defaults={'name': f"{user.name}'s Public Watchlist"}
        )
        return {
            'private': private_watchlist,
            'public': public_watchlist
        }

    @staticmethod
    def add_to_watchlist(user_id, media_id, visibility='private'):
        watchlists = WatchListService.get_or_create_user_watchlist(user_id)
        watchlist= watchlists[visibility]
        WatchlistItem.objects.get_or_create(
            watchlist=watchlist,
             media_id=media_id
        )
        return True

    @staticmethod
    def remove_from_watchlist(user_id, media_id, visibility='private'):
        watchlists = WatchListService.get_or_create_user_watchlist(user_id)
        watchlist= watchlists[visibility]
        deleted, _ = WatchlistItem.objects.filter(
            watchlist=watchlist,
             media_id=media_id
        ).delete()
        if deleted == 0:
            raise ValueError("This media is not in your watchlist")
        return True
    @staticmethod
    def get_watchlist_items(user_id, visibility='private'):
        watchlists = WatchListService.get_or_create_user_watchlist(user_id)
        watchlist= watchlists[visibility]
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT m.media_id, m.title, m.media_type, m.poster_url,
                       m.aggregate_rating, m.release_date, wi.added_at
                FROM watchlist_item wi
                JOIN media m ON wi.media_id = m.media_id
                WHERE wi.watchlist_id = %s
                ORDER BY wi.added_at DESC
            """, [watchlist.watchlist_id])
            return dictfetchall(cursor)

    @staticmethod
    def get_public_watchlist(user_id):
        return WatchListService.get_watchlist_items(user_id, visibility='public')
    
    @staticmethod
    def toggle_watchlist(user_id, media_id, visibility='private'):
        watchlists = WatchListService.get_or_create_user_watchlist(user_id)
        watchlist = watchlists[visibility]

        item = WatchlistItem.objects.filter(
            watchlist=watchlist,
            media_id=media_id
        ).first()

        if item:
            item.delete()
            return "removed"
        else:
            WatchlistItem.objects.create(
                watchlist=watchlist,
                media_id=media_id
            )
            return "added"


class WatchHistoryServices:
    @staticmethod
    def record_watch(user_id, media_id, episode_id=None):
        try:
            WatchHistory.objects.create(
                user_id=user_id,
                media_id=media_id,
                episode_id=episode_id
            )
            return True
        except Exception as e:
            raise ValueError(str(e))
    @staticmethod
    def get_watch_history(user_id, limit=50):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT ON (wh.media_id)
                       wh.media_id, m.title, m.poster_url, m.media_type,
                       m.aggregate_rating, wh.watched_at,
                       e.episode_id, e.title AS episode_title, e.episode_number,
                       s.season_number
                FROM watch_history wh
                JOIN media m ON wh.media_id = m.media_id
                LEFT JOIN episode e ON wh.episode_id = e.episode_id
                LEFT JOIN season s ON e.season_id = s.season_id
                WHERE wh.user_id = %s
                ORDER BY wh.media_id, wh.watched_at DESC
                LIMIT %s
            """, [user_id, limit])
            return dictfetchall(cursor)

    @staticmethod
    def get_recently_watched(user_id, media_type=None, limit=10):
        """Get recently watched content"""
        sql = """
            SELECT DISTINCT ON (wh.media_id)
                   wh.media_id, m.title, m.poster_url, m.media_type,
                   m.aggregate_rating, wh.watched_at
            FROM watch_history wh
            JOIN media m ON wh.media_id = m.media_id
            WHERE wh.user_id = %s
        """
        params = [user_id]

        if media_type:
            sql += " AND m.media_type = %s"
            params.append(media_type)

        sql += " ORDER BY wh.media_id, wh.watched_at DESC LIMIT %s"
        params.append(limit)

        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return dictfetchall(cursor)

class ReviewInteractionService:
    @staticmethod
    def like_review(user_id, review_id):
        try:
            ReviewLike.objects.create(
                user_id=user_id,
                review_id=review_id
            )
            return True
        except Exception as e:
            raise ValueError(str(e))
    @staticmethod
    def unlike_review(user_id, review_id):
        deleted, _ = ReviewLike.objects.filter(
            user_id=user_id,
            review_id=review_id
        ).delete()
        if deleted == 0:
            raise ValueError("You have not liked this review")
        return True
    @staticmethod
    def get_review_like_count(review_id):
        return ReviewLike.objects.filter(review_id=review_id).count()

    @staticmethod
    def has_user_liked_review(user_id, review_id):
        return ReviewLike.objects.filter(user_id=user_id, review_id=review_id).exists()

class PlatformService:
    @staticmethod
    def get_platforms_for_media(media_id, region=None):
        sql="""
        SELECT p.platform_id, p.platform_name, p.platform_type, p.logo_url,
                   mp.region, mp.availability_date
            FROM media_platform mp
            JOIN platform p ON mp.platform_id = p.platform_id
            WHERE mp.media_id = %s
        """
        params=[media_id]
        if region:
            sql += " AND mp.region = %s"
            params.append(region)
        sql+= "ORDER BY p.platform_name"
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return dictfetchall(cursor)

    @staticmethod
    def get_media_on_platform(platform_id, region=None, media_type=None):
        sql="""
        SELECT m.media_id, m.title, m.media_type, m.poster_url, m.aggregate_rating, m.release_date, mp.region
        FROM media_platform mp
        JOIN media m ON mp.media_id = m.media_id
        WHERE mp.platform_id = %s
        """
        params=[platform_id]
        if region:
            sql+= " AND mp.region = %s"
            params.append(region)
        if media_type:
            sql+= " AND m.media_type = %s"
            params.append(media_type)

        sql+= " ORDER BY m.aggregate_rating DESC NULLS LAST"
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return dictfetchall(cursor)

class TVMetadataService:
    @staticmethod
    def get_episodes_for_season(season_id):
        return Episode.objects.filter(season_id=season_id).order_by('episode_number')
    @staticmethod
    def get_seasons_with_episodes(season_id):
        season= Season.objects.get(pk=season_id)
        episodes= TVMetadataService.get_episodes_for_season(season_id)
        return {
            "season": {
                "season_id": season.season_id,
                "season_number": season.season_number,
                "release_date": season.release_date,
                "total_episodes": season.total_episodes
            },
            "episodes": list(episodes.values())
        }
    @staticmethod
    def get_next_episode(media_id, current_episode_id):
        current = Episode.objects.get(pk=current_episode_id)
        next_ep=Episode.objects.filter(
            season=current.season,
            episode_number= current.episode_number+1
        ).first()
        if next_ep:
            return next_ep

        next_season=Season.objects.filter(
            media_id=media_id,
            season_number=current.season.season_number+1
        ).first()

        if next_season:
            return Episode.objects.filter(
                season=next_season,
                episode_number=1
            ).first()

        return None
    @staticmethod
    def get_all_seasons_for_show(media_id):
        with connection.cursor() as cursor:
            cursor.execute("""
            SELECT s.season_id, s.season_number, s.release_date,
                   s.total_episodes, COUNT(e.episode_id) AS episode_count
            FROM season s
            LEFT JOIN episode e ON s.season_id = e.season_id
            WHERE s.media_id = %s
            GROUP BY s.season_id, s.season_number, s.release_date, s.total_episodes
            ORDER BY s.season_number
        """, [media_id])
            return dictfetchall(cursor)
class RecommendationService:
    @staticmethod
    def get_similar_media(media_id, limit=10):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT m.media_id, m.title, m.poster_url, m.media_type, m.aggregate_rating, ms.similarity_score
                FROM media_similarity ms
                JOIN media m ON(
                    CASE
                        WHEN ms.media_id_1 = %s THEN ms.media_id_2
                        ELSE ms.media_id_1
                    END = m.media_id
                )
                WHERE ms.media_id_1=%s OR ms.media_id_2=%s
                ORDER BY ms.similarity_score DESC
                LIMIT %s
                """, [media_id, media_id, media_id, limit]
            )
            return dictfetchall(cursor)

    @staticmethod
    def get_recommendation_by_genre(user_id, limit=20):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                WITH user_genres AS(
                    SELECT DISTINCT mg.genre_id
                    FROM watch_history wh
                    JOIN media_genre mg ON wh.media_id=mg.media_id
                    WHERE wh.user_id=%s
                    )
                SELECT m.media_id, m.title, m.poster_url, m.media_type, m.aggregate_rating, m.release_date, COUNT(DISTINCT mg.genre_id) AS genre_match_count
                FROM media m
                JOIN media_genre mg ON m.media_id = mg.media_id
                WHERE mg.genre_id IN (SELECT genre_id FROM user_genres)
                   AND m.media_id NOT IN(
                       SELECT media_id FROM watch_history WHERE user_id=%s
                   )
                GROUP BY m.media_id
                ORDER BY genre_match_count DESC, m.aggregate_rating DESC
                LIMIT %s
                """,[user_id, user_id, limit]
            )
            return dictfetchall(cursor)
    @staticmethod
    def get_trending_media(media_type=None, region=None, limit=20):
        """Get trending media based on recent watch history and ratings"""
        sql = """
            SELECT m.media_id, m.title, m.poster_url, m.media_type,
                   m.aggregate_rating, m.total_reviews,
                   COUNT(wh.user_id) AS recent_watch_count
            FROM media m
            LEFT JOIN watch_history wh ON m.media_id = wh.media_id
                AND wh.watched_at >= NOW() - INTERVAL '7 days'
            WHERE m.aggregate_rating IS NOT NULL
        """
        params = []

        if media_type:
            sql += " AND m.media_type = %s"
            params.append(media_type)

        sql += """
            GROUP BY m.media_id
            ORDER BY recent_watch_count DESC, m.aggregate_rating DESC
            LIMIT %s
        """
        params.append(limit)

        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return dictfetchall(cursor)
    @staticmethod
    def get_recommendation_for_user(user_id, limit=20):
        genre_recs=RecommendationService.get_recommendation_by_genre(user_id,limit=10)
        trending= RecommendationService.get_trending_media(limit=10)

        seen_ids= set()
        combined=[]
        for item in genre_recs+trending:
            if item['media_id'] not in seen_ids:
                combined.append(item)
                seen_ids.add(item['media_id'])
            if len(combined) >= limit:
                break
        return combined

class ShowingService:
    @staticmethod
    def get_showtimes_by_location(city=None, region = None, date = None):
        sql ="""
        SELECT sh.showing_id, m.title, m.poster_url,
               c.name AS cinema_name, c.city, c.region, c.location,
               sc.screen_name, sc.screen_type,
               sh.show_date, sh.show_time, sh.available_seats, sh.price
        FROM showing sh
        JOIN screen sc ON sh.screen_id = sc.screen_id
        JOIN cinema c ON sc.cinema_id = c.cinema_id
        JOIN movie mo ON sh.media_id = mo.media_id
        JOIN media m ON mo.media_id = m.media_id
        WHERE sh.available_seats > 0
    """
        params=[]
        if city:
            sql += " AND c.city = %s"
            params.append(city)
        if region:
            sql += " AND c.region = %s"
            params.append(region)

        if date:
            sql += " AND sh.show_date = %s"
            params.append(date)

        sql += " ORDER BY sh.show_date, sh.show_time"
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return dictfetchall(cursor)
