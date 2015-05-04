/* global appWindowManager, performance */
(function() {
  'use strict';

  document.getElementById('test-button').addEventListener('click', function() {
    var times = parseInt(document.getElementById('test-times').value, 10);
    if (isNaN(times) || times < 1) {
      times = 100;
    }

    var iframe = appWindowManager.getActiveApp().browser.element;
    var start = performance.now();
    for(var i = 0; i < times; i++) {
      iframe.blur();
      iframe.focus();
    }
    var end = performance.now();
    console.log('avg: ', (end - start) / times);
  });
})();

