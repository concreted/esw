// this is the service worker which intercepts all http requests
var CACHE_NAME = 'ESW_CACHE';


self.addEventListener('fetch', function fetcher (event) {
  var request = event.request;
  if (request.url.split(':')[0] !== 'file') {
    // console.log('============== fetching a request ===============')
    // console.log(request)
    // console.log(event)
    // console.log(request.url)
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        // console.log('loaded the cache')
        // console.log(cache)
        // console.log(request.headers.get('content-type'));
        // if (request.headers.get('range')) {
        // for json api calls, always try going to network first
        // because we prioritize the most up to date content.
        if (request.headers.get('content-type') === 'application/json') {
          console.log('json request');
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
          }
          // for all other requests (i.e. images, videos) try to load from disk cache
          // if present to avoid unnecessary network calls.
          console.log('content request')
          return cache.match(event.request)
            .then(function(response) {
              if (!response) {
                return fetch(event.request)
                  .then(function(response) {
                    // if it succeeds, save to cache and return.
                    console.log('request succeeded');
                    console.log(response);
                    cache.put(event.request, response.clone());
                    console.log('cached the response!')
                    return response;
                  })
              }
              else {
                console.log('found in cache!')
                return response
              }
            })
            .catch(function(err) {
              console.log('not found in cache..!')
            })
        })
    );
  }
});
