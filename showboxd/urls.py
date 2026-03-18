from django.urls import path
from . import views

urlpatterns = [
    path('catalog/', views.get_media_catalog, name='catalog'),
    path('media/<int:media_id>/', views.get_media_details, name='media_details'),
    path('movie/showtimes/<int:movie_id>/', views.get_movie_showtimes, name='movie_showtimes'),

    path('review/', views.submit_review, name='submit_review'),
    path('booking/', views.create_ticket_booking, name='create_ticket_booking'),
    path('booking/<int:booking_id>/', views.cancel_ticket_booking, name='cancel_ticket_booking'),
]