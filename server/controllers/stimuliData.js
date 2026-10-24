/**
 * Standardized Affective Stimuli Library
 * Validated emotion evocation materials across three valence categories:
 * - Pleasant: Uplifting, joyful, serene (nature, cute animals, celebratory, heartwarming)
 * - Neutral: Everyday objects, geometry, household items, calm ambient scenes
 * - Unpleasant: Storms, tension, dilapidated structures, harsh environments
 */

const STIMULI_DATA = [
  // Pleasant Videos & Photos
  {
    id: 'pleasant-vid-01',
    category: 'pleasant',
    type: 'video',
    title: 'Sunny Meadow & Golden Sunlight',
    description: 'Gentle golden light filtering through blooming wildflowers with calm breeze.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    recommendedDurationSeconds: 8
  },
  {
    id: 'pleasant-img-01',
    category: 'pleasant',
    type: 'photo',
    title: 'Playful Golden Retriever Puppy',
    description: 'A joyful golden retriever puppy playing happily on green grass.',
    mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    recommendedDurationSeconds: 6
  },
  {
    id: 'pleasant-img-02',
    category: 'pleasant',
    type: 'photo',
    title: 'Serene Alpine Lake & Mountains',
    description: 'Crystal clear turquoise mountain lake under a brilliant blue sky.',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    recommendedDurationSeconds: 6
  },

  // Neutral Videos & Photos
  {
    id: 'neutral-vid-01',
    category: 'neutral',
    type: 'video',
    title: 'Mechanical Clockwork & Pendulum',
    description: 'Steady, rhythmic ticking of a minimalist clock mechanism.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    recommendedDurationSeconds: 8
  },
  {
    id: 'neutral-img-01',
    category: 'neutral',
    type: 'photo',
    title: 'Standard Architectural Grid & Facade',
    description: 'Repetitive geometric concrete window frames in overcast natural light.',
    mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    recommendedDurationSeconds: 6
  },
  {
    id: 'neutral-img-02',
    category: 'neutral',
    type: 'photo',
    title: 'Still Life Household Objects',
    description: 'A wooden table with a standard ceramic cup and notepad.',
    mediaUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80',
    recommendedDurationSeconds: 6
  },

  // Unpleasant Videos & Photos
  {
    id: 'unpleasant-vid-01',
    category: 'unpleasant',
    type: 'video',
    title: 'Harsh Thunderstorm & Dark Gale',
    description: 'Turbulent, dark stormy skies with heavy downpour and ominous wind.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
    recommendedDurationSeconds: 8
  },
  {
    id: 'unpleasant-img-01',
    category: 'unpleasant',
    type: 'photo',
    title: 'Gloomy Abandoned Industrial Corridor',
    description: 'Dark, cold concrete hallway with peeling paint and stagnant water.',
    mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    recommendedDurationSeconds: 6
  },
  {
    id: 'unpleasant-img-02',
    category: 'unpleasant',
    type: 'photo',
    title: 'Severe Barren Desolation & Drought Cracks',
    description: 'Parched, cracked earth in an arid barren wasteland under oppressive heat.',
    mediaUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
    recommendedDurationSeconds: 6
  }
];

module.exports = { STIMULI_DATA };
