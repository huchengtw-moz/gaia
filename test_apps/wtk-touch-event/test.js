window.addEventListener('load', function() {
  function $(id) {
    return document.getElementById(id);
  }

  $('touch-start').addEventListener('touchstart', function() {
    alert('touch start');
  });
  $('touch-end').addEventListener('touchend', function() {
    alert('touch end');
  });

  $('touch-move').addEventListener('touchend', function() {
    $('touch-move').textContent = 'Touch Move';
  });

  $('touch-move').addEventListener('touchmove', function(e) {
    $('touch-move').textContent = 'x:' + e.touches[0].clientX +
                                  ',y:' + e.touches[0].clientY;
  });
});
