var CACHE_NAME='moph-cbt-v5.0';
var ASSETS=['./?v=50','index.html?v=50','style.css?v=50','script.js?v=50','questions.js?v=50','manifest.webmanifest?v=50'];
self.addEventListener('install',function(event){self.skipWaiting();event.waitUntil(caches.open(CACHE_NAME).then(function(cache){return cache.addAll(ASSETS)}));});
self.addEventListener('activate',function(event){event.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(key){if(key!==CACHE_NAME)return caches.delete(key)}));}).then(function(){return self.clients.claim()}));});
self.addEventListener('fetch',function(event){if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(function(response){var copy=response.clone();caches.open(CACHE_NAME).then(function(cache){cache.put(event.request,copy)});return response;}).catch(function(){return caches.match(event.request).then(function(r){return r||caches.match('./?v=50')})}));});
