// this is the service worker which intercepts all http requests
var CACHE_NAME = 'ESW_CACHE';

self.addEventListener('fetch', function fetcher (event) {
  var request = event.request;
  if (request.url.split(':')[0] !== 'file') {
    console.log('============== fetching a request ===============')
    console.log(request)
    console.log(event)
    console.log(request.url)
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        console.log('loaded the cache')
        console.log(cache)
        // try making the network request.
        if (request.headers.get('range')) {
          console.log('content request')
          return cache.match(event.request)
            .then(function(response) {
              if (!response) {
                fetch(event.request)
                  .then(function(response) {
                    // if it succeeds, save to cache and return.
                    console.log('request succeeded');
                    console.log(response);
                    cache.put(event.request, response.clone());
                    console.log('cached the response!')
                    return response;
                  })
              }
              console.log('found in cache!')
              return response
            })
            .catch(function(err) {
              console.log('not found in cache..!')
            })
        }
        return fetch(event.request)
          .then(function(response) {
            // if it succeeds, save to cache and return.
            console.log('request succeeded');
            console.log(response);
            cache.put(event.request, response.clone());
            console.log('cached the response!')
            return response;
          })
          .catch(function(err) {
            // if it fails, try returning cache.
            console.log('checking the cache...')
            return cache.match(event.request)
              .then(function(response) {
                if (!response) {
                  throw Error('fail')
                }
                console.log('found in cache!')
                return response
              })
              .catch(function(err) {
                console.log('not found in cache..!')
              })
          })
      })
    );
  }
});
