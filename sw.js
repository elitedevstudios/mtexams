const CACHE_NAME = 'learning-adventure-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/workbook-review.html',
  '/manifest.json',
  '/css/base.css',
  '/css/components.css',
  '/css/navigation.css',
  '/css/quiz.css',
  '/css/animations.css',
  '/css/math-interactive.css',
  '/js/app.js',
  '/js/feedback.js',
  '/js/math-interactive.js',
  '/js/quiz-engine.js',
  '/js/storage.js',
  '/js/workbook-review.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/quizzes/computer-studies.json',
  '/quizzes/creative-writing.json',
  '/quizzes/english-grammar.json',
  '/quizzes/integrated-studies.json',
  '/quizzes/mathematics-assessment-1.json',
  '/quizzes/mathematics-assessment-2.json',
  '/quizzes/mathematics-assessment-3.json',
  '/quizzes/mathematics.json',
  '/quizzes/music.json',
  '/quizzes/phonics.json',
  '/quizzes/reading-comprehension.json',
  '/quizzes/spanish.json',
  '/quizzes/spelling-dictation.json',
  '/quizzes/workbooks/workbooks-index.json',
  '/quizzes/workbooks/ali-baba-stories/a-strange-treasure.json',
  '/quizzes/workbooks/ali-baba-stories/androcles-and-the-lion.json',
  '/quizzes/workbooks/integrated-language-arts/nouns-and-pronouns.json',
  '/quizzes/workbooks/integrated-language-arts/verbs.json',
  '/quizzes/workbooks/integrated-phonics/phonics.json',
  '/quizzes/workbooks/rediscovering-mathematics/chapter-1-numbers.json',
  '/quizzes/workbooks/rediscovering-mathematics/chapter-2-addition.json',
  '/quizzes/workbooks/rediscovering-mathematics/chapter-3-subtraction.json',
  '/quizzes/workbooks/rediscovering-mathematics/chapter-4-time.json',
  '/quizzes/workbooks/rediscovering-mathematics/chapter-5-shapes.json',
  '/quizzes/workbooks/rediscovering-mathematics/chapter-6-money.json',
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin, network-only for others
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
