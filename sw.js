const CACHE_NAME = 'learning-adventure-v14';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './workbook-review.html',
  './lessons.html',
  './assessments.html',
  './parent-dashboard.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/navigation.css',
  './css/quiz.css',
  './css/animations.css',
  './css/math-interactive.css',
  './css/lessons.css',
  './js/app.js',
  './js/feedback.js',
  './js/math-interactive.js',
  './js/quiz-engine.js',
  './js/storage.js',
  './js/tts.js',
  './js/certificate.js',
  './js/parent-dashboard.js',
  './js/workbook-review.js',
  './js/lessons.js',
  './js/attendance.js',
  './js/pwa-install.js',
  './js/modal-a11y.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './quizzes/computer-studies.json',
  './quizzes/creative-writing.json',
  './quizzes/english-grammar.json',
  './quizzes/integrated-studies.json',
  './quizzes/mathematics-assessment-1.json',
  './quizzes/mathematics-assessment-2.json',
  './quizzes/mathematics-assessment-3.json',
  './quizzes/language-arts-assessment-1.json',
  './quizzes/language-arts-assessment-2.json',
  './quizzes/language-arts-assessment-3.json',
  './quizzes/integrated-studies-assessment-1.json',
  './quizzes/integrated-studies-assessment-2.json',
  './quizzes/integrated-studies-assessment-3.json',
  './quizzes/mathematics.json',
  './quizzes/music.json',
  './quizzes/phonics.json',
  './quizzes/reading-comprehension.json',
  './quizzes/spanish.json',
  './quizzes/spelling-dictation.json',
  './quizzes/workbooks/workbooks-index.json',
  './quizzes/workbooks/ali-baba-stories/a-strange-treasure.json',
  './quizzes/workbooks/ali-baba-stories/androcles-and-the-lion.json',
  './quizzes/workbooks/integrated-language-arts/nouns-and-pronouns.json',
  './quizzes/workbooks/integrated-language-arts/verbs.json',
  './quizzes/workbooks/integrated-phonics/phonics.json',
  './quizzes/workbooks/integrated-phonics/vowel-sounds.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-sets.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-1-numbers.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-2-addition.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-3-subtraction.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-4-time.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-5-shapes.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-6-money.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-expanded-notation.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-capacity.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-division.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-multiplication.json',
  './quizzes/workbooks/rediscovering-mathematics/chapter-bigger-numbers.json',
  './quizzes/workbooks/nsc-practice/jamaica-parishes.json',
  './quizzes/workbooks/nsc-practice/possessive-pronouns.json',
  './quizzes/workbooks/nsc-practice/symmetry.json',
  './quizzes/workbooks/nsc-practice/materials-properties.json',
  './quizzes/workbooks/nsc-practice/rights-responsibilities.json',
  './quizzes/lessons/lessons-index.json',
  './quizzes/lessons/language-arts/alphabet-letter-sounds.json',
  './quizzes/lessons/language-arts/cvc-short-vowels.json',
  './quizzes/lessons/language-arts/magic-e.json',
  './quizzes/lessons/language-arts/digraphs.json',
  './quizzes/lessons/language-arts/blends.json',
  './quizzes/lessons/language-arts/diphthongs.json',
  './quizzes/lessons/language-arts/pronouns.json',
  './quizzes/lessons/mathematics/comparing-sets.json',
  './quizzes/lessons/mathematics/counting-100.json',
  './quizzes/lessons/mathematics/place-value.json',
  './quizzes/lessons/mathematics/expanded-form.json',
  './quizzes/lessons/mathematics/addition-10.json',
  './quizzes/lessons/mathematics/number-bonds.json',
  './quizzes/lessons/mathematics/subtraction-10.json',
  './quizzes/lessons/integrated-studies/my-body.json',
  './quizzes/lessons/integrated-studies/five-senses.json',
  './quizzes/lessons/integrated-studies/healthy-eating.json',
  './quizzes/lessons/integrated-studies/feelings.json',
  './quizzes/lessons/language-arts/plural-nouns.json',
  './quizzes/lessons/language-arts/proper-nouns.json',
  './quizzes/lessons/language-arts/past-tense.json',
  './quizzes/lessons/language-arts/subject-verb.json',
  './quizzes/lessons/language-arts/predictions.json',
  './quizzes/lessons/language-arts/main-idea.json',
  './quizzes/lessons/language-arts/story-writing.json',
  './quizzes/lessons/mathematics/subtraction-20.json',
  './quizzes/lessons/mathematics/add-regrouping.json',
  './quizzes/lessons/mathematics/sub-regrouping.json',
  './quizzes/lessons/mathematics/word-problems.json',
  './quizzes/lessons/mathematics/skip-counting.json',
  './quizzes/lessons/mathematics/multiplication-intro.json',
  './quizzes/lessons/mathematics/telling-time.json',
  './quizzes/lessons/integrated-studies/families.json',
  './quizzes/lessons/integrated-studies/community-helpers.json',
  './quizzes/lessons/integrated-studies/goods-services.json',
  './quizzes/lessons/integrated-studies/living-nonliving.json',
  './quizzes/lessons/integrated-studies/plants.json',
  './quizzes/lessons/language-arts/word-families.json',
  './quizzes/lessons/language-arts/context-clues.json',
  './quizzes/lessons/language-arts/conjunctions.json',
  './quizzes/lessons/language-arts/adjectives.json',
  './quizzes/lessons/language-arts/informational-writing.json',
  './quizzes/lessons/language-arts/fluency.json',
  './quizzes/lessons/mathematics/hundreds.json',
  './quizzes/lessons/mathematics/compare-999.json',
  './quizzes/lessons/mathematics/measurement.json',
  './quizzes/lessons/mathematics/money.json',
  './quizzes/lessons/mathematics/2d-shapes.json',
  './quizzes/lessons/mathematics/3d-shapes.json',
  './quizzes/lessons/integrated-studies/weather.json',
  './quizzes/lessons/integrated-studies/water-cycle.json',
  './quizzes/lessons/integrated-studies/environment.json',
  './quizzes/lessons/integrated-studies/national-symbols.json',
  './quizzes/lessons/integrated-studies/national-heroes.json',
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
    // ignoreSearch: index fetches use ?v= cache-busters; still serve precache offline
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
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
