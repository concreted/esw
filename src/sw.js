// this is the service worker which intercepts all http requests
var CACHE_NAME = 'ESW_CACHE';

function rangeable_resp(request, resp){
    // Return the response, obeying the range header if given
    // NOTE: Does not support 'if-range' or multiple ranges!
    // TODO: Temporary implementation, waiting on official fix:
    // https://github.com/whatwg/fetch/issues/144
    // https://github.com/slightlyoff/ServiceWorker/issues/703

    // Validate range value (return whole resp if null or invalid)
    let range = /^bytes\=(\d*)\-(\d*)$/gi.exec(request.headers.get('range'))
    if (range === null || (range[1] === '' && range[2] === ''))
        return resp

    // Get the body as an array buffer
    return resp.arrayBuffer().then(function(ab){
        let total = ab.byteLength
        let start = Number(range[1])
        let end = Number(range[2])
        // Handle no start value (end is therefore an _offset_ from real end)
        // NOTE: testing on range var, as start/end Number('') -> 0
        if (range[1] === ''){
            start = total - end
            end = total - 1
        }
        // Handle no end value
        if (range[2] === ''){
            end = total - 1
        }
        // Handle invalid values
        if (start > end || end >= total || start < 0)
            return resp  // Ignore whole range (NOTE: may not follow spec here)
        // Add range headers to response's headers
        let headers = new Headers()
        for (let [k, v] of resp.headers)
            headers.set(k, v)
        headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
        headers.set('Content-Length', end - start + 1)
        // Return ranged response
        return new Response(ab.slice(start, end + 1), {
            'status': 206,
            'statusText': 'Partial Content',
            'headers': headers,
        })
    })
}

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
