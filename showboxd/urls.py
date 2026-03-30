from django.urls import path
from . import views
urlpatterns = [
    # Authentication
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/verify/', views.verify_token_view, name='verify_jwt_token'),

    # Media Catalog
    path('catalog/', views.get_media_catalog, name='catalog'),
    path('search/', views.search_media, name='search_media'),
    path('genres/', views.get_genres, name='get_genres'),
    path('media/<int:media_id>/', views.get_media_details, name='media_details'),

    # Reviews
    path('review/', views.submit_review, name='submit_review'),
    path('review/<int:review_id>/like/', views.like_review, name='like_review'),
    path('review/<int:review_id>/unlike/', views.unlike_review, name='unlike_review'),

    # Bookings
    path('booking/', views.create_ticket_booking, name='create_ticket_booking'),
    path('booking/<int:booking_id>/cancel/', views.cancel_ticket_booking, name='cancel_ticket_booking'),
    path('user/<int:user_id>/bookings/', views.get_user_bookings, name='get_user_bookings'),
    path('movie/showtimes/<int:movie_id>/', views.get_movie_showtimes, name='movie_showtimes'),

    # Recommendations & Similar
    path('media/<int:media_id>/similar/', views.get_similar_media, name='similar_media'),
    path('user/<int:user_id>/recommendations/', views.get_recommendations, name='recommendations'),
    path('trending/', views.get_trending, name='trending'),

    # Watchlist
    path('watchlist/add/', views.add_to_watchlist, name='add_to_watchlist'),
    path('watchlist/remove/', views.remove_from_watchlist, name='remove_from_watchlist'),
    path('watchlist/<int:user_id>/<str:visibility>/', views.get_my_watchlist, name='get_my_watchlist'),

    # Watch History
    path('watch/', views.record_watch, name='record_watch'),
    path('user/<int:user_id>/history/', views.get_user_watch_history, name='get_user_watch_history'),

    # TV Shows
    path('tvshow/<int:media_id>/seasons/', views.get_tv_show_seasons, name='get_tv_seasons'),
    path('season/<int:season_id>/', views.get_season_details, name='get_season_details'),
    path('episode/<int:episode_id>/next/', views.get_next_episode, name='get_next_episode'),

    # Platforms
    path('media/<int:media_id>/platforms/', views.get_media_platforms, name='get_media_platforms'),
    path('platform/<int:platform_id>/content/', views.get_platform_content, name='get_platform_content'),
]