// this is the service worker which intercepts all http requests
self.addEventListener('fetch', function fetcher (event) {
  var request = event.request;
  if (request.url.split(':')[0] !== 'file') {
    console.log('============== fetching a request ===============')
    console.log(request)
    console.log(event)
    console.log(request.url)
    // if the
    event.respondWith(

      caches.open('mysite-dynamic').then(function(cache) {
        console.log('loaded the cache')
        console.log(cache)
        // try making the network request.
        return fetch(event.request)
          .then(function(response) {
            // if it succeeds, save to cache and return.
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
