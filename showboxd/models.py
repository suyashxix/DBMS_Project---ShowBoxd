from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Platform(models.Model):
    platform_id = models.AutoField(primary_key = True)
    platform_name = models.CharField(max_length = 100, unique = True)
    platform_type = models.CharField(max_length = 20, null = True, blank = True)
    logo_url = models.CharField(max_length = 500, null = True, blank = True)
    class Meta:
        db_table = 'platform'

class MediaPlatform(models.Model):
    media = models.ForeignKey('Media', on_delete = models.CASCADE, db_column = 'media_id')
    platform = models.ForeignKey(Platform, on_delete = models.CASCADE, db_column = 'platform_id')
    region = models.CharField(max_length = 100)
    availability_date = models.DateField(null=  True, blank = True)

    pk = models.CompositePrimaryKey('media', 'platform', 'region')
    class Meta:
        db_table = 'media_platform'
        indexes = [
            models.Index(fields=['region']),
            models.Index(fields=['platform', 'region']),
        ]

class MediaSimilarity(models.Model):
    media_1 = models.ForeignKey('Media', on_delete = models.CASCADE, db_column = 'media_id_1', related_name='similarity_as_1')
    media_2 = models.ForeignKey('Media', on_delete = models.CASCADE, db_column = 'media_id_2', related_name='similarity_as_2')
    similarity_score = models.DecimalField(max_digits = 5, decimal_places= 4)
    pk = models.CompositePrimaryKey('media_1', 'media_2')
    class Meta:
        db_table = 'media_similarity'
        indexes = [
            models.Index(fields=['media_1', '-similarity_score']),
            models.Index(fields=['media_2', '-similarity_score']),
        ]

class ReviewLike(models.Model):
    review = models.ForeignKey('Review', on_delete = models.CASCADE, db_column = 'review_id')
    user=  models.ForeignKey('Users', on_delete = models.CASCADE, db_column= 'user_id')
    liked_at = models.DateTimeField(auto_now_add = True)
    pk = models.CompositePrimaryKey('review', 'user')
    class Meta:
        db_table = 'review_like'
        indexes =[
            models.Index(fields=['review']),
            models.Index(fields=['user']),
        ]

class WatchHistory(models.Model):
    user= models.ForeignKey('Users', on_delete = models.CASCADE, db_column='user_id')
    media = models.ForeignKey('Media', on_delete = models.CASCADE, db_column='media_id')
    episode = models.ForeignKey('Episode', on_delete = models.CASCADE, db_column='episode_id', null = True, blank = True)
    watched_at = models.DateTimeField(auto_now_add = True)
    pk = models.CompositePrimaryKey('user', 'media', 'watched_at')
    class Meta:
        db_table = 'watch_history'
        indexes =[
            models.Index(fields=['user', 'watched_at']),
            models.Index(fields=['media']),
        ]


class Media(models.Model):

    media_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    #Check for the type of media (movie or TV show)
    MEDIA_TYPES = [('movie', 'Movie'), ('tv_show', 'TV Show')]
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    language= models.CharField(max_length=50)
    release_date = models.DateField(null=True, blank=True)
    duration_minutes= models.IntegerField(null=True, blank=True)
    poster_url = models.URLField(max_length=500, null=True, blank=True)
    description= models.TextField(null=True, blank=True)

    aggregate_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'media'
        indexes =[
            models.Index(fields=['media_type']),
            models.Index(fields=['release_date']),
            models.Index(fields=['aggregate_rating']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['media_type', 'aggregate_rating']),
            models.Index(fields=['title']),
            models.Index(fields=['language']),
        ]

class Movie(models.Model):
    media= models.OneToOneField(Media, on_delete=models.CASCADE, primary_key=True)
    box_office_revenue = models.BigIntegerField(null=True, blank=True)
    theatrical_release = models.BooleanField(default=True)
    class Meta:
        db_table = 'movie'

class TVShow(models.Model):
    media = models.OneToOneField(Media, on_delete=models.CASCADE, primary_key=True)
    total_seasons = models.IntegerField(default=0)
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('upcoming', 'Upcoming'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    class Meta:
        db_table = 'tv_show'

class Season(models.Model):
    season_id = models.AutoField(primary_key=True)
    media = models.ForeignKey(TVShow, on_delete=models.CASCADE, db_column='media_id')
    season_number= models.IntegerField()
    release_date= models.DateField(null=True, blank=True)
    total_episodes=models.IntegerField(default=0)
    class Meta:
        db_table = 'season'
        unique_together= (('media', 'season_number'),)
        indexes= [
            models.Index(fields=['media', 'season_number']),
        ]

class Episode(models.Model):
    episode_id= models.AutoField(primary_key=True)
    season = models.ForeignKey(Season, on_delete=models.CASCADE, db_column='season_id')
    media = models.ForeignKey(Media, on_delete=models.CASCADE, db_column= 'media_id')
    episode_number = models.IntegerField()
    title= models.CharField(max_length=255)
    duration_minutes = models.IntegerField(null=True, blank = True)
    release_date = models.DateField(null = True, blank = True)
    description = models.TextField(null = True, blank = True)
    class Meta:
        db_table = 'episode'
        unique_together = (('season', 'episode_number'),)
        indexes = [
            models.Index(fields=['season', 'episode_number']),
            models.Index(fields=['media']),
        ]

class Genre(models.Model):
    genre_id = models.AutoField(primary_key = True)
    genre_name = models.CharField(max_length= 50, unique= True)
    class Meta:
        db_table = 'genre'

class MediaGenre(models.Model):
    media = models.ForeignKey(Media, on_delete =models.CASCADE, db_column='media_id')
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE, db_column='genre_id')
    pk = models.CompositePrimaryKey('media', 'genre')

    class Meta:
        db_table = 'media_genre'
        indexes = [
            models.Index(fields=['media']),
            models.Index(fields=['genre']),
        ]

class Person(models.Model):
    person_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length = 150)
    bio = models.TextField(null= True, blank= True)
    birth_date = models.DateField(null = True, blank= True)
    profile_image_url = models.URLField(max_length= 500, null = True, blank = True)
    class Meta:
        db_table = 'person'

class CastCrew(models.Model):
    media = models.ForeignKey(Media, on_delete= models.CASCADE, db_column= 'media_id')
    person= models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    ROLE_CHOICES = [
        ('actor', 'Actor'),
        ('director', 'Director'),
        ('writer', 'Writer'),
        ('producer', 'Producer'),
        ('composer', 'Composer'),
        ('cinematographer', 'Cinematographer'),
    ]
    role = models.CharField(max_length = 50, choices = ROLE_CHOICES)
    character_name= models.CharField(max_length = 150, null = True, blank = True)
    pk = models.CompositePrimaryKey('media', 'person', 'role')
    class Meta:
        db_table = 'cast_crew'
        indexes = [
            models.Index(fields=['media']),
            models.Index(fields=['person']),
            models.Index(fields=['media','role']),
        ]

class Review(models.Model):
    review_id = models.AutoField(primary_key = True)
    media = models.ForeignKey(Media, on_delete = models.CASCADE, db_column = 'media_id')
    user = models.ForeignKey('Users', on_delete = models.CASCADE, db_column='user_id') # Assuming user IDs are integers
    rating = models.DecimalField(max_digits = 3, decimal_places = 1)
    review_text = models.TextField(null= True, blank = True)
    review_date = models.DateField(auto_now_add = True)
    created_at = models.DateTimeField(auto_now_add = True)
    class Meta:
        db_table = 'review'
        unique_together = (('media', 'user'),)
        indexes = [
            models.Index(fields=['media']),
            models.Index(fields=['user']),
            models.Index(fields=['-review_date']),
            models.Index(fields=['media', '-review_date']),
        ]

class Cinema(models.Model):
    cinema_id = models.AutoField(primary_key = True)
    name = models.CharField(max_length = 150)
    location = models.CharField(max_length = 100)
    region = models.CharField(max_length = 100)
    city = models.CharField(max_length = 100)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null = True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null = True)
    class Meta:
        db_table = 'cinema'
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['region']),
        ]

class Screen(models.Model):
    screen_id = models.AutoField(primary_key = True)
    cinema = models.ForeignKey(Cinema, on_delete = models.CASCADE, db_column = 'cinema_id')
    screen_name = models.CharField(max_length = 50)
    total_seats = models.IntegerField()
    screen_type = models.CharField(max_length = 30, null = True)
    class Meta:
        db_table = 'screen'
        unique_together = (('cinema', 'screen_name'),)
        indexes = [
            models.Index(fields=['cinema', 'screen_name']),
        ]

class Showing(models.Model):
    showing_id = models.AutoField(primary_key = True)
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, db_column = 'screen_id')
    media= models.ForeignKey(Movie, on_delete=models.CASCADE, db_column = 'media_id')
    show_date = models.DateField()
    show_time = models.TimeField()
    available_seats = models.IntegerField()
    price = models.DecimalField(max_digits = 10, decimal_places=2)
    class Meta:
        db_table = 'showing'
        unique_together = (('screen', 'show_date', 'show_time'),)
        indexes = [
            models.Index(fields=['media', 'show_date']),
            models.Index(fields=['show_date', 'show_time']),
            models.Index(fields=['screen', 'show_date']),
        ]
class Booking(models.Model):
    booking_id = models.AutoField(primary_key = True)
    user = models.ForeignKey('Users', on_delete = models.CASCADE, db_column='user_id')
    showing = models.ForeignKey(Showing, on_delete= models.PROTECT, db_column= 'showing_id')
    seats_booked = models.IntegerField()
    total_price = models.DecimalField(max_digits = 10, decimal_places =2)
    booking_time = models.DateTimeField(auto_now_add = True)
    booking_status = models.CharField(max_length = 20, default = 'confirmed')
    class Meta:
        db_table = 'booking'
        indexes=[
            models.Index(fields=['user']),
            models.Index(fields=['showing']),
            models.Index(fields=['-booking_time']),
            models.Index(fields=['booking_status']),
        ]
class Users(models.Model):
    user_id = models.AutoField(primary_key = True)
    name = models.CharField(max_length= 100)
    email = models.EmailField(max_length= 255, unique = True)
    region = models.CharField(max_length = 100)
    password_hash = models.CharField(max_length = 255)
    preferred_language = models.CharField(max_length = 50, null = True, blank = True)
    is_verified = models.BooleanField(default= False)
    role = models.CharField(max_length = 20, default = 'user')
    created_at = models.DateTimeField(auto_now_add= True)


    def __str__(self):
        return self.email
    class Meta:
        db_table = 'users'
        indexes=[
            models.Index(fields=['email']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['region']),
            models.Index(fields=['role']),
        ]
class Watchlist(models.Model):
    watchlist_id = models.AutoField(primary_key = True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id')
    name = models.CharField(max_length= 100)
    visibility = models.CharField(max_length = 10, choices=[('public', 'Public'), ('private', 'Private')])
    created_at = models.DateTimeField(auto_now_add= True)
    class Meta:
        db_table = 'watchlist'
        indexes = [
            models.Index(fields=['user','visibility']),
        ]
class WatchlistItem(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete = models.CASCADE, db_column= 'watchlist_id')
    media = models.ForeignKey(Media, on_delete= models.CASCADE, db_column= 'media_id')
    added_at = models.DateTimeField(auto_now_add= True)
    pk = models.CompositePrimaryKey('watchlist','media')
    class Meta:
        db_table = 'watchlist_item'
        indexes = [
            models.Index(fields=['watchlist', '-added_at']),
        ]