"""
Django management command to generate media_similarity entries for all media combinations.

Usage:
    python manage.py generate_media_similarities

This will calculate and populate the media_similarity table with similarity scores
for all pairs of media items based on shared genres and other attributes.
"""

from django.core.management.base import BaseCommand
from django.db import connection, transaction
from showboxd.models import Media, MediaSimilarity
import random


class Command(BaseCommand):
    help = 'Generates media_similarity entries for all media combinations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing similarities before generating new ones',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing similarities...')
            MediaSimilarity.objects.all().delete()

        self.stdout.write('Fetching all media...')
        all_media = list(Media.objects.all().values('media_id', 'media_type'))

        if len(all_media) < 2:
            self.stdout.write(self.style.WARNING('Need at least 2 media items to generate similarities'))
            return

        self.stdout.write(f'Found {len(all_media)} media items')
        self.stdout.write('Calculating similarities...')

        similarities = []
        processed = 0
        all_media = sorted(
            Media.objects.all().values('media_id', 'media_type'),
            key=lambda x: x['media_id']
        )
        # Generate all unique pairs
        for i in range(len(all_media)):
            for j in range(i + 1, len(all_media)):
                media1 = all_media[i]
                media2 = all_media[j]

                # Calculate similarity score based on shared genres
                score = self.calculate_similarity(media1['media_id'], media2['media_id'])

                if score > 0.3:  # Only add if similarity is above threshold
                    similarities.append(
                        MediaSimilarity(
                            media_1_id=media1['media_id'],
                            media_2_id=media2['media_id'],
                            similarity_score=score
                        )
                    )

                processed += 1
                if processed % 100 == 0:
                    self.stdout.write(f'Processed {processed} pairs...')

        # Bulk create all similarities
        self.stdout.write(f'Creating {len(similarities)} similarity entries...')

        with transaction.atomic():
            MediaSimilarity.objects.bulk_create(similarities, ignore_conflicts=True)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(similarities)} media similarity entries'
            )
        )

    def calculate_similarity(self, media_id_1, media_id_2):
        """
        Calculate similarity score between two media items.

        Factors considered:
        - Shared genres (primary factor)
        - Same media type (movie vs TV show)
        - Rating proximity
        """
        with connection.cursor() as cursor:
            # Count shared genres
            cursor.execute("""
                SELECT COUNT(*) as shared_genres
                FROM media_genre mg1
                JOIN media_genre mg2 ON mg1.genre_id = mg2.genre_id
                WHERE mg1.media_id = %s AND mg2.media_id = %s
            """, [media_id_1, media_id_2])

            result = cursor.fetchone()
            shared_genres = result[0] if result else 0

            # Get media details
            cursor.execute("""
                SELECT m1.media_type, m1.aggregate_rating,
                       m2.media_type, m2.aggregate_rating,
                       (SELECT COUNT(*) FROM media_genre WHERE media_id = %s) as m1_genre_count,
                       (SELECT COUNT(*) FROM media_genre WHERE media_id = %s) as m2_genre_count
                FROM media m1, media m2
                WHERE m1.media_id = %s AND m2.media_id = %s
            """, [media_id_1, media_id_2, media_id_1, media_id_2])

            details = cursor.fetchone()
            if not details:
                return 0.0

            m1_type, m1_rating, m2_type, m2_rating, m1_genres, m2_genres = details

        # Base score from shared genres (0.0 - 0.7)
        if m1_genres > 0 and m2_genres > 0:
            genre_similarity = (shared_genres / min(m1_genres, m2_genres)) * 0.7
        else:
            genre_similarity = 0.0

        # Bonus for same media type (0.0 - 0.2)
        type_bonus = 0.2 if m1_type == m2_type else 0.0

        # Bonus for similar ratings (0.0 - 0.1)
        rating_bonus = 0.0
        if m1_rating and m2_rating:
            rating_diff = abs(float(m1_rating) - float(m2_rating))
            rating_bonus = max(0, (10 - rating_diff) / 100)

        # Total score
        total_score = min(genre_similarity + type_bonus + rating_bonus, 1.0)

        # Add some randomness to make it more realistic (±0.05)
        randomness = (random.random() - 0.5) * 0.1
        final_score = max(0.0, min(1.0, total_score + randomness))

        return round(final_score, 4)