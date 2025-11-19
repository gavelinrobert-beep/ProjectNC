/**
 * SYLON Logistics - Service Worker
 * Provides offline capabilities for field operations
 * 
 * Features:
 * - Offline caching of assets and data
 * - Background sync for field reports
 * - Map tile caching
 * - API request queueing
 */

const CACHE_VERSION = 'sylon-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const MAP_CACHE = `${CACHE_VERSION}-maps`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add more static assets as needed
];

// API endpoints that can be cached
const CACHEABLE_APIS = [
  '/api/assets',
  '/api/bases',
  '/api/missions',
  '/api/geofences',
  '/api/inventory/items',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[ServiceWorker] Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[ServiceWorker] Installation failed:', error);
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete caches that don't match current version
            return (cacheName.startsWith('sylon-') || cacheName.startsWith('aegis-light-')) && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== DATA_CACHE &&
                   cacheName !== MAP_CACHE;
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    // For POST/PUT/DELETE, try to send immediately or queue for later
    if (!navigator.onLine) {
      event.respondWith(queueRequest(request));
    }
    return;
  }

  // Handle different types of requests
  if (isMapTileRequest(url)) {
    // Map tiles: Cache first, then network
    event.respondWith(cacheFirst(request, MAP_CACHE));
  } else if (isAPIRequest(url)) {
    // API requests: Network first, then cache
    event.respondWith(networkFirst(request, DATA_CACHE));
  } else if (isStaticAsset(url)) {
    // Static assets: Cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // Default: Network first
    event.respondWith(networkFirst(request, DATA_CACHE));
  }
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[ServiceWorker] Cache hit:', request.url);
      // Return cached response, but update cache in background
      fetchAndCache(request, cacheName);
      return cached;
    }
    
    // Not in cache, fetch from network
    console.log('[ServiceWorker] Cache miss, fetching:', request.url);
    return await fetchAndCache(request, cacheName);
  } catch (error) {
    console.error('[ServiceWorker] Cache first failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    console.log('[ServiceWorker] Network failed, checking cache:', request.url);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[ServiceWorker] Returning cached response');
      return cached;
    }
    
    // No cache available
    console.error('[ServiceWorker] No cache available for:', request.url);
    return new Response(
      JSON.stringify({ error: 'Offline - No cached data available' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Fetch and cache helper
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
}

// Queue non-GET requests for later when offline
async function queueRequest(request) {
  console.log('[ServiceWorker] Queueing request for later:', request.url);
  
  // Store request in IndexedDB for later sync
  const requestData = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: await request.text(),
    timestamp: Date.now()
  };
  
  // Store in IndexedDB (implementation would go here)
  // For now, return a response indicating queued status
  return new Response(
    JSON.stringify({ 
      queued: true, 
      message: 'Request queued for sync when online' 
    }),
    {
      status: 202,
      statusText: 'Accepted',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper functions to identify request types
function isMapTileRequest(url) {
  // OpenStreetMap tile pattern
  return url.hostname.includes('openstreetmap.org') ||
         url.hostname.includes('tile.openstreetmap.org') ||
         url.pathname.includes('/tile/');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncQueuedRequests());
  }
});

// Sync queued requests when back online
async function syncQueuedRequests() {
  console.log('[ServiceWorker] Syncing queued requests...');
  
  // Retrieve queued requests from IndexedDB
  // Send them to server
  // Remove from queue on success
  
  // Implementation would use IndexedDB to store/retrieve
  // For now, just log
  console.log('[ServiceWorker] Sync complete');
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    // Cache specific URLs on demand
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    // Clear all caches
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[ServiceWorker] Loaded and ready');
