// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

function fetchData (url) {
  return fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  .catch(error => {
    console.log('I FAILED')
  })
}

// register service worker
navigator.serviceWorker.register('sw.js', { scope: './' })
  .then(navigator.serviceWorker.ready)
  .then(function () {
    console.log('service worker registered')
  })
  .catch(function (error) {
    console.log('error when registering service worker', error, arguments)
  });

// log used space
navigator.webkitTemporaryStorage.queryUsageAndQuota (
    function(usedBytes, grantedBytes) {
        console.log('Temporary storage: Using ', usedBytes / 1000000, ' MB of ', grantedBytes / 1000000, 'MB');
    },
    function(e) { console.log('Failed to query temporary storage data: Error', e);  }
);

fetchData('https://api.getmira.com/ping')
  .then(function(response) {
      console.log(response)
      return response.json()
  })
  .then(function(data) {
      document.getElementById('ping').innerHTML = JSON.stringify(data)
  })


