/* global appWindowManager, performance */
(function() {
  'use strict';

  document.getElementById('test-button').addEventListener('click', function() {
    var times = parseInt(document.getElementById('test-times').value, 10);
    if (isNaN(times) || times < 1) {
      times = 100;
    }

    var iframe = appWindowManager.getActiveApp().browser.element;
    var start;
    var timeToFocus = [];
    var timeToBlur = [];
    var focusStart;
    var blurStart;

    function handleFocus() {
      timeToFocus.push(performance.now() - focusStart);
      if (document.activeElement !== iframe) {
        console.error('wrong state, we had got focus but active element is ' +
          'not iframe.');
      }
      if (times === 0) {
        var totalFocus = timeToFocus.reduce(function(prev, cur) {
          return prev + cur;
        }, 0);
        var totalBlur = timeToBlur.reduce(function(prev, cur) {
          return prev + cur;
        }, 0);
        console.log(timeToFocus);
        console.log('avg focus: ', (totalFocus / timeToFocus.length));
        console.log(timeToBlur);
        console.log('avg blur: ', (totalBlur / timeToBlur.length));
        iframe.removeEventListener('focus', handleFocus);
        iframe.removeEventListener('blur', handleBlur);
      } else {
        blurStart = performance.now();
        iframe.blur();
      }
    }

    function handleBlur() {
      timeToBlur.push(performance.now() - blurStart);
      if (document.activeElement === iframe) {
        console.error('wrong state, we had got blur but active element is ' +
          'still iframe.');
      }
      setTimeout(function() {
        focusStart = performance.now();
        iframe.focus();
        times--;
      });
    }

    iframe.addEventListener('focus', handleFocus);
    iframe.addEventListener('blur', handleBlur);

    start = performance.now();
    if (document.activeElement === iframe) {
      blurStart = performance.now();
      iframe.blur();
    } else {
      focusStart = performance.now();
      iframe.focus();
      times--;
    }
  });
})();

