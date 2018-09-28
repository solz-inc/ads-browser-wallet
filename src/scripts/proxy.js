const {
  CONN_ID_PROXY,
} = require('./enums');

// connection with background script
const port = chrome.runtime.connect(chrome.i18n.getMessage('@@extension_id'), { name: CONN_ID_PROXY });
// TODO remove port.onDisconnect - added for debug purpose
port.onDisconnect.addListener((port) => {
  console.log(`proxy.js: disconnected with background ${new Date().toString()}`);
  console.log(port);
});

window.addEventListener('message', (event) => {
  console.log('proxy.js: onMessage');
  console.log(event);
  if (event.data && event.data === 'init') {
    // redirect messages from background to page
    port.onMessage.addListener((message) => {
      console.log('background -> page');
      console.log(message);
      event.ports[0].postMessage(message);
    });

    // redirect messages from page to background
    event.ports[0].onmessage = (message) => {
      console.log('page -> background');
      console.log(message.data);
      port.postMessage(message.data);
    };

    // accept connection from page
    event.ports[0].postMessage('ready');
  }
}, false);
