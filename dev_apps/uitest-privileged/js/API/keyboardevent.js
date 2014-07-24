'use stricts';

window.addEventListener('keydown', function(e) {
  var div = document.getElementById('message');
  div.textContent = 'keydown: ' + e.key;
});

window.addEventListener('keyup', function(e) {
  var div = document.getElementById('message');
  div.textContent = 'keyup: ' + e.key;
});
