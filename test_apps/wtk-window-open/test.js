window.setTimeout(function() {
  alert('before-window-open');
  window.open('http://www.mozilla.org.tw');
  alert('after-window-open');
}, 1000);
