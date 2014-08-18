window.onload = function() {
  var textToSend = document.getElementById('send-parent');
  var received = document.getElementById('received-message');

  document.getElementById('send-button').addEventListener('click', function() {
    window.location.hash = '#app:' + encodeURIComponent(textToSend.value);
  });

  window.addEventListener('hashchange', function() {
    if ('#app:' === window.location.hash.substring(0, 5)) {
      return;
    }
    // trim #parent:
    var data = window.location.hash.substring(8);
    received.textContent = decodeURIComponent(data);
  });
};
