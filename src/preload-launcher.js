// preload-launcher.js
const { remote } = require('electron');

// comment out this line to work with electron .
require('electron-compile/lib/initialize-renderer').initializeRendererProcess(remote.getGlobal('globalCompilerHost').readOnlyMode);

// require('path/to/real/preload');
navigator.serviceWorker.register('sw.js', { scope: './', type: 'module' })
  .then(navigator.serviceWorker.ready)
  .then(function () {
    console.log('service worker registered')
  })
  .catch(function (error) {
    console.log('error when registering service worker', error, arguments)
  });

console.log('done running preload script');
