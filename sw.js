var CACHE_NAME='moph-cbt-v8.0';
var ASSETS=['./?v=80','index.html?v=80','style.css?v=80','script.js?v=80','questions.js?v=80','manifest.webmanifest?v=80'];
self.addEventListener('install',function(event){self.skipWaiting();event.waitUntil(caches.open(CACHE_NAME).then(function(cache){return cache.addAll(ASSETS)}));});
self.addEventListener('activate',function(event){event.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(key){if(key!==CACHE_NAME)return caches.delete(key)}));}).then(function(){return self.clients.claim()}));});
self.addEventListener('fetch',function(event){if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(function(response){var copy=response.clone();caches.open(CACHE_NAME).then(function(cache){cache.put(event.request,copy)});return response;}).catch(function(){return caches.match(event.request).then(function(r){return r||caches.match('./?v=80')})}));});
